package com.example.mymusic

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import androidx.media3.common.MediaItem
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors

@CapacitorPlugin(name = "NativeAudio")
class NativeAudioPlugin : Plugin() {

    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller: MediaController? = null

    private fun ensureController(call: PluginCall) {
        if (controller != null) {
            call.resolve()
            return
        }

        val token = SessionToken(
            context,
            ComponentName(context, AudioService::class.java)
        )
        controllerFuture = MediaController.Builder(context, token).buildAsync()
        controllerFuture?.addListener({
            try {
                controller = controllerFuture?.get()
                call.resolve()
            } catch (e: Exception) {
                call.reject("Failed to connect to audio service: ${e.message}")
            }
        }, MoreExecutors.directExecutor())
    }

    @PluginMethod
    fun play(call: PluginCall) {
        val uri = call.getString("uri") ?: run {
            call.reject("Missing 'uri' parameter")
            return
        }

        if (controller == null) {
            // Connect first, then play
            val token = SessionToken(
                context,
                ComponentName(context, AudioService::class.java)
            )
            controllerFuture = MediaController.Builder(context, token).buildAsync()
            controllerFuture?.addListener({
                try {
                    controller = controllerFuture?.get()
                    controller?.setMediaItem(MediaItem.fromUri(uri))
                    controller?.prepare()
                    controller?.play()
                    call.resolve()
                } catch (e: Exception) {
                    call.reject("Play failed: ${e.message}")
                }
            }, MoreExecutors.directExecutor())
        } else {
            controller?.setMediaItem(MediaItem.fromUri(uri))
            controller?.prepare()
            controller?.play()
            call.resolve()
        }
    }

    @PluginMethod
    fun pause(call: PluginCall) {
        controller?.pause()
        call.resolve()
    }

    @PluginMethod
    fun resume(call: PluginCall) {
        controller?.play()
        call.resolve()
    }
}