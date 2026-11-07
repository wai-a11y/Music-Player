package com.example.mymusic

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(NativeAudioPlugin::class.java)
        super.onCreate(savedInstanceState)

        // Clear any stale WebView cache from previous installs
        val webView: WebView? = this.bridge.webView
        webView?.clearCache(true)
        webView?.settings?.cacheMode = WebSettings.LOAD_NO_CACHE
    }
} 