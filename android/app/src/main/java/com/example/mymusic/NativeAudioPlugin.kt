package com.example.mymusic

import android.content.ComponentName
import androidx.media3.common.MediaItem
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
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

    private fun connect(onReady: (MediaController) -> Unit, onError: (String) -> Unit) {
        controller?.let { onReady(it); return }

        val token = SessionToken(context, ComponentName(context, AudioService::class.java))
        controllerFuture = MediaController.Builder(context, token).buildAsync()
        controllerFuture?.addListener({
            try {
                val c = controllerFuture?.get()
                controller = c
                if (c != null) onReady(c) else onError("Controller null after connect")
            } catch (e: Exception) {
                onError("Connect failed: ${e.message}")
            }
        }, MoreExecutors.directExecutor())
    }

    @PluginMethod
    fun play(call: PluginCall) {
        val urisArray = call.getArray("uris")
        val singleUri = call.getString("uri")
        val startIndex = call.getInt("startIndex") ?: 0

        val uriList: List<String> = when {
            urisArray != null -> {
                val list = mutableListOf<String>()
                for (i in 0 until urisArray.length()) {
                    urisArray.getString(i)?.let { list.add(it) }
                }
                list
            }
            singleUri != null -> listOf(singleUri)
            else -> {
                call.reject("Missing 'uris' or 'uri' parameter")
                return
            }
        }

        if (uriList.isEmpty()) {
            call.reject("Empty URI list")
            return
        }

        connect(
            onReady = { c ->
                try {
                    val items = uriList.map { MediaItem.fromUri(it) }
                    c.setMediaItems(items, startIndex.coerceIn(0, items.size - 1), 0L)
                    c.prepare()
                    c.play()
                    call.resolve()
                } catch (e: Exception) {
                    call.reject("Play failed: ${e.message}")
                }
            },
            onError = { msg -> call.reject(msg) }
        )
    }

    @PluginMethod
    fun pause(call: PluginCall) {
        connect(
            onReady = { c -> c.pause(); call.resolve() },
            onError = { msg -> call.reject(msg) }
        )
    }

    @PluginMethod
    fun resume(call: PluginCall) {
        connect(
            onReady = { c -> c.play(); call.resolve() },
            onError = { msg -> call.reject(msg) }
        )
    }
}