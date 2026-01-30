package com.cony.manage.domain.geofence.repository;

import com.cony.manage.domain.geofence.entity.Store;

public interface StoreWithDistance {
    Store getStore();
    Double getDist();
}
