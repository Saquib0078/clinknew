package com.nirmiteepublic.clink.functions.helpers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

/**
 * Created by Sahil The Geek
 * Date : 13-05-2023.
 *
 * <p>This {@link ConnectivityReceiver} Always check internet connectivity in runtime</p>
 */
public class ConnectivityReceiver extends BroadcastReceiver {

    private final Listener listener;

    public ConnectivityReceiver(Listener listener) {
        this.listener = listener;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo networkInfo = connectivityManager.getActiveNetworkInfo();
        boolean isConnected = (networkInfo != null && networkInfo.isConnected());
        if (listener != null) {
            listener.onConnectivityChanged(isConnected);
        }
    }

    public interface Listener {
        void onConnectivityChanged(boolean isConnected);
    }
}
