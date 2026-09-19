package com.railgo.entity;

public enum SeatType {
    LOWER("Lower Berth"),
    MIDDLE("Middle Berth"),
    UPPER("Upper Berth"),
    SIDE_LOWER("Side Lower"),
    SIDE_UPPER("Side Upper"),
    WINDOW("Window Seat"),
    AISLE("Aisle Seat"),
    MIDDLE_CHAIR("Middle Seat");

    private final String displayName;

    SeatType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
