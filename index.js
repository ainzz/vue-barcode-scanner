const VueBarcodeScanner = {
	install(Vue, options) {
		let attributes = {
			previouseCode: '',
			barcode: '',
			setting: {
				sound: false,
				soundSrc: '',
				scannerSensitivity: 100
			},
			callback: null,
			hasListener: false,
			pressedTime: [],
			lastPressedKeyControl: false,
			lastPressedKeyShift: false,
			lastKeyHadShift: false,
			combinations: {
				'`': '~',
				'1': '!',
				'2': '@',
				'3': '#',
				'4': '$',
				'5': '%',
				'6': '^',
				'7': '&',
				'8': '*',
				'9': '(',
				'0': ')',
				'-': '_',
				'+': '+',
				'<': '>',
				',': '<',
				'.': '>',
				'/': '?',
				';': ':',
				'\'': '"',
				'\\': '|',
				'[': '{',
				']': '}',
			}
		}

		// initial plugin setting
		if (options) {
			attributes.setting.sound = options.sound || attributes.setting.sound
			attributes.setting.soundSrc = options.soundSrc || attributes.setting.soundSrc
			attributes.setting.scannerSensitivity = options.sensitivity || attributes.setting.scannerSensitivity
		}

		Vue.prototype.$barcodeScanner = {}

		Vue.prototype.$barcodeScanner.init = (callback) => {
			// add listenter for scanner
			// use keypress to separate lower/upper case character from scanner
			addListener('keyup')
			// use keydown only to detect Tab event (Tab cannot be detected using keypress)
			addListener('keydown')
			attributes.callback = callback
		}

		Vue.prototype.$barcodeScanner.destroy = () => {
			// remove listener
			removeListener('keyup')
			removeListener('keydown')
		}

		Vue.prototype.$barcodeScanner.hasListener = () => {
			return attributes.hasListener
		}

		Vue.prototype.$barcodeScanner.getPreviousCode = () => {
			return attributes.previousCode
		}

		Vue.prototype.$barcodeScanner.setSensitivity = (sensitivity) => {
			attributes.setting.scannerSensitivity = sensitivity
		}

		function addListener(type) {
			if (attributes.hasListener) {
				removeListener(type)
			}
			window.addEventListener(type, onInputScanned)
			attributes.hasListener = true
		}

		function removeListener(type) {
			if (attributes.hasListener) {
				window.removeEventListener(type, onInputScanned)
				attributes.hasListener = false
			}
		}

		function onInputScanned(event) {

			// ignore other keydown event that is not a TAB, so there are no duplicate keys
			if (event.type === 'keydown' && event.keyCode != 9) {
				return
			}
			if (checkInputElapsedTime(Date.now())) {
				if ((event.keyCode === 13 || event.keyCode === 9) && attributes.barcode !== '') {
					// scanner is done and trigger Enter/Tab then clear barcode and play the sound if it's set as true
					attributes.callback(attributes.barcode)
					// backup the barcode
					attributes.previousCode = attributes.barcode
					// clear textbox
					attributes.barcode = ''
					// clear pressedTime
					attributes.pressedTime = []
					// trigger sound
					if (attributes.setting.sound) {
						triggerSound()
					}
					// prevent TAB navigation for scanner
					if (event.charCode === 9) {
						event.preventDefault()
					}
				} else {
					var cchode = event.keyCode || event.charCode;
					// scan and validate each charactor
					if (event.location === 0 && !attributes.lastPressedKeyControl) {
						attributes.barcode += attributes.lastPressedKeyShift ? (attributes.combinations.hasOwnProperty(event.key) ? attributes.combinations[event.key] : event.key.toUpperCase()) : event.key
					}

					attributes.lastPressedKeyControl = (event.key === 'Control')
					attributes.lastPressedKeyShift = (event.key === 'Shift' && !attributes.lastKeyHadShift)
					attributes.lastKeyHadShift = (event.key !== 'Shift' && event.key !== 'Control' && event.shiftKey) || false
				}
			}
		}

		// check whether the keystrokes are considered as scanner or human
		function checkInputElapsedTime(timestamp) {
			// console.log(attributes.pressedTime);
			// console.log(attributes.barcode);
			// push current timestamp to the register
			if (attributes.pressedTime.length === 1 && ((timestamp - attributes.pressedTime[0]) > attributes.setting.scannerSensitivity)) {
				attributes.barcode = ''
			}
			attributes.pressedTime = []
			attributes.pressedTime.push(timestamp)
			// when register is full (ready to compare)
			// if (attributes.pressedTime.length === 2) {
			//     // compute elapsed time between 2 keystrokes
			//     let timeElapsed = attributes.pressedTime[1] - attributes.pressedTime[0];
			//     // too slow (assume as human)
			//     if (timeElapsed >= attributes.setting.scannerSensitivity) {
			//         // put latest key char into barcode
			//         // if(event.location === 0%7GCCF026017) attributes.barcode = event.key
			//         // remove(shift) first timestamp in register
			//         attributes.pressedTime.shift()
			//         attributes.barcode = ''
			//         // not fast enough
			//     }
			//     // fast enough (assume as scanner)
			//     else {
			//         // reset the register
			//     }
			// } else if (attributes.pressedTime.length === 1 && (timestamp - attributes.pressedTime[0]) > attributes.setting.scannerSensitivity) attributes.barcode = ''
			//
			// not able to check (register is empty before pushing) or assumed as scanner
			return true
		}

		// init audio and play
		function triggerSound() {
			let audio = new Audio(attributes.setting.soundSrc)
			audio.play()
		}
	}
}

// // Automatic installation if Vue has been added to the global scope.
// if (typeof window !== 'undefined' && window.Vue) {
//   window.Vue.use(MyPlugin)
// }

module.exports = VueBarcodeScanner