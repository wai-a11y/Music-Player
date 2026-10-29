package com.example.mymusic

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(NativeAudioPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}