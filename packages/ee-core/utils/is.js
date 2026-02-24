'use strict';

// Checks if we are in renderer process
function renderer () {
  return process.type === 'renderer'
}

// Checks if we are in main process
function main() {
  return process.type === 'browser'
}

// Checks if we are under Mac OS
function osx() {
  return process.platform === 'darwin'
}

// Checks if we are under Mac OS
function macOS() {
  return osx()
}

// Checks if we are under Windows OS
function windows() {
  return process.platform === 'win32'
}

// Checks if we are under Linux OS
function linux() {
  return process.platform === 'linux'
}

// Checks if we are the processor's arch is x86
function x86() {
  return process.arch === 'ia32'
}

// Checks if we are the processor's arch is x64
function x64() {
  return process.arch === 'x64'
}

// Checks if the app is running in a sandbox on macOS
function sandbox() {
  return 'APP_SANDBOX_CONTAINER_ID' in process.env
}

// Checks if the app is running as a Mac App Store build
function mas() {
  return process.mas === true
}

// Checks if the app is running as a Windows Store (appx) build
function windowsStore() {
  return process.windowsStore === true
}

// checks if all the 'is functions' passed as arguments are true
function all() {
  const isFunctions = new Array(arguments.length)
  for (var i = 0; i < isFunctions.length; i++) {
    isFunctions[i] = arguments[i]
  }
  if (!isFunctions.length) return
  for (i = 0; i < isFunctions.length; i++) {
    if (!isFunctions[i]()) return false
  }
  return true
}

// checks if all the 'is functions' passed as arguments are false
function none() {
  const isFunctions = new Array(arguments.length)
  for (var i = 0; i < isFunctions.length; i++) {
    isFunctions[i] = arguments[i]
  }
  if (!isFunctions.length) return
  for (i = 0; i < isFunctions.length; i++) {
    if (isFunctions[i]()) return false
  }
  return true
}

// returns true if one of the 'is functions' passed as argument is true
function one() {
  const isFunctions = new Array(arguments.length)
  for (var i = 0; i < isFunctions.length; i++) {
    isFunctions[i] = arguments[i]
  }
  if (!isFunctions.length) return
  for (i = 0; i < isFunctions.length; i++) {
    if (isFunctions[i]()) return true
  }
  return false
}

module.exports = {
  renderer,
  main,
  osx,
  macOS,
  windows,
  linux,
  x86,
  x64,
  sandbox,
  mas,
  windowsStore,
  all,
  none,
  one,
};