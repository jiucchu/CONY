package com.cony.manage.domain.geofence.service;

import com.cony.manage.domain.geofence.dto.GeofenceDto;

public interface GeofenceService {
    public GeofenceDto.Response getNearbyStores(GeofenceDto.Request request);
}
