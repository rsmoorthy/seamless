/**
 The MIT License

 Copyright (c) 2017 Isha Foundation

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 **/
import {ResizeSensor} from 'css-element-queries'

class Seamless {
  constructor (params = {}) {
    this.params = {...params}
    this.resizeTimeout = 300
    this.resize = this.resize.bind(this)
    this.throttle = this.throttle.bind(this)
    this.inited = false
    this.init()
  }

  init () {
    if (!this.params.parent && !this.params.child) {
      this.parent = (window.parent === window)
      this.child = (window.parent !== window)
    } else {
      this.parent = this.params.parent
      this.child = this.params.child
    }
    this.params.acceptFrom = this.params.acceptFrom ? this.params.acceptFrom : window.location.host
    window.addEventListener('message', this.rcvMessage.bind(this), false)

    // parent
    if (this.parent) {
      if (window.parent !== window) {
        return
      }
      window.addEventListener('resize', this.throttle, false)
      let ele = this.params.childElement ? this.params.childEement : 'iframe'
      ele = document.querySelector(ele)
      if (ele && ele.contentWindow) {
        this.childWindow = ele.contentWindow
        this.childElement = ele
        // If data-src is present, then we use that and set the src of iframe
        if (ele.getAttribute('data-src')) {
          ele.onload = () => this.sendMessage({type: 'init'})
          var params = ele.getAttribute('data-params') ? ele.getAttribute('data-params') : ''
          var urlparams = ele.getAttribute('data-copyurlparams') ? window.location.search.substring(1) : ''
          params += ((params.length && urlparams.length) ? '&' : '') + urlparams

          var src = ele.getAttribute('data-src')
          src += params.length ? (((src.match(/\?/)) ? '&' : '?') + params) : ''
          ele.src = src
        }
      }
      this.sendMessage({type: 'init'})
    }

    if (this.child) {
      if (window.parent === window) {
        return
      }
      if (!this.params.selector) {
        return console.log('Specify selector while starting the child, for resize to be proper')
      }
      let sel = document.querySelector(this.params.selector)
      if (!sel) {
        return console.log('Specify selector ' + this.params.selector + ' does not exist')
      }
      this.selector = sel
      this.sendMessage({type: 'init'})
      // this.sendMessage({type: 'resize', ...this.getSize()})
      let sensor = new ResizeSensor(this.selector, (ev) => this.resize(ev, this.selector), false) // eslint-disable-line no-unused-vars
      this.overrideAlerts()
    }
    this.params.onStart ? this.params.onStart() : null  // eslint-disable-line no-unused-expressions
  }

  throttle (event, selector) {
    if (!this.resizeQueued) {
      this.resizeQueued = setTimeout(() => { this.resizeQueued = null; this.resize(event, selector) }, this.resizeTimeout)
    }
  }

  resize (event, selector) {
    if (this.child) {
      let msg = this.getSize()
      this.sendMessage({type: 'resize', ...msg})
    }

    if (this.parent) {
      this.sendMessage({type: 'resize'})
    }
  }

  getSize () {
    if (this.child && this.selector) {
      return {width: this.selector.clientWidth + 20, height: this.selector.clientHeight + 40}
    }
    return {}
  }

  setSize (obj) {
    if (this.parent && this.childElement && obj && obj.height) {
      this.childElement.style.height = (obj.height + 40) + 'px'
    }
  }

  sendMessage (msg) {
    if (this.child) {
      window.parent.postMessage(msg, '*')
    }
    if (this.parent && this.childWindow) {
      this.childWindow.postMessage(msg, '*')
    }
  }

  // src can be array or regexp
  // target is the target
  matchTarget (src, target) {
    if (typeof (src) === 'string') {
      if (src === target) {
        return true
      }
      if (target.match(src)) {
        return true
      }
      return false
    } else if (typeof (src) === 'object') {
      for (var i = 0; i < src.length; i++) {
        if (this.matchTarget(src[i], target)) {
          return true
        }
      }
      return false
    }
    return false
  }

  rcvMessage (ev) {
    if (!(this.matchTarget(this.params.acceptFrom, ev.origin) || this.matchTarget(window.location.protocol + '//' + window.location.host, ev.origin))) {
      return
    }
    if (ev.data.type === 'debug') {
      window[ev.data.key] = ev.data.value
      return
    }
    if (this.parent) {
      if (ev.data.type === 'init') {
        this.inited = true
        this.params.onInit ? this.params.onInit() : null  // eslint-disable-line no-unused-expressions
        this.sendMessage({type: 'init'})
        this.sendMessage({type: 'resize'})
      }
      if (ev.data.type === 'resize') {
        this.setSize(ev.data)
      }
      if (ev.data.type === 'alert') {
        window.bootbox ? window.bootbox.alert(ev.data.message) : window.alert(ev.data.message)
      }
      if (ev.data.type === 'scrollTo') {
        this.childElement.scrollIntoView({behavior: 'smooth', block: 'auto'})
      }
      if (ev.data.type === 'redirect' && ev.data.url) {
        window.location.href = ev.data.url
      }
    }
    if (this.child) {
      if (ev.data.type === 'resize' || ev.data.type === 'getsize') {
        this.sendMessage({type: 'resize', ...this.getSize()})
      }
      if (ev.data.type === 'init') {
        this.inited = true
        this.params.onInit ? this.params.onInit() : null  // eslint-disable-line no-unused-expressions
      }
    }
  }

  overrideAlerts () {
    window.alert = (msg) => {
      this.sendMessage({type: 'alert', message: msg})
    }
    if (window.bootbox) {
      window.bootbox.alert = window.alert
    }
  }
}

export default Seamless
