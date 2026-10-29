package com.example.mymusic

import android.app.PendingIntent
import android.content.Intent
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

class AudioService : MediaSessionService() {

    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()

        // Create the ExoPlayer instance
        val player = ExoPlayer.Builder(this).build()

        // Create the MediaSession wrapping the player.
        // The activity PendingIntent lets the lock screen/notification
        // return the user to the app when tapped.
        val sessionActivityIntent = packageManager
            .getLaunchIntentForPackage(packageName)
            ?.let { PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE) }

        mediaSession = MediaSession.Builder(this, player)
            .apply { if (sessionActivityIntent != null) setSessionActivity(sessionActivityIntent) }
            .build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
        }
        mediaSession = null
        super.onDestroy()
    }
}