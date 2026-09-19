package com.railgo.entity;

public enum CoachType {
    FIRST_AC("1A", "AC First Class", 2.4, 24),
    TWO_TIER_AC("2A", "AC 2 Tier", 1.6, 48),
    THREE_TIER_AC("3A", "AC 3 Tier", 1.1, 64),
    SLEEPER("SL", "Sleeper Class", 0.45, 72),
    CHAIR_CAR("CC", "AC Chair Car", 0.85, 75),
    SECOND_SEATING("2S", "Second Seating", 0.25, 108);

    private final String code;
    private final String displayName;
    private final double baseRatePerKm;
    private final int defaultSeats;

    CoachType(String code, String displayName, double baseRatePerKm, int defaultSeats) {
        this.code = code;
        this.displayName = displayName;
        this.baseRatePerKm = baseRatePerKm;
        this.defaultSeats = defaultSeats;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getBaseRatePerKm() {
        return baseRatePerKm;
    }

    public int getDefaultSeats() {
        return defaultSeats;
    }

    public static CoachType fromCode(String code) {
        for (CoachType type : values()) {
            if (type.getCode().equalsIgnoreCase(code) || type.name().equalsIgnoreCase(code)) {
                return type;
            }
        }
        return THREE_TIER_AC;
    }
}
