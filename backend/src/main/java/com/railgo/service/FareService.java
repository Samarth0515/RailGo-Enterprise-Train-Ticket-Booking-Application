package com.railgo.service;

import com.railgo.entity.CoachType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FareService {

    @Value("${app.booking.reservation-fee:40.0}")
    private double defaultReservationFee;

    @Value("${app.booking.gst-rate-ac:0.05}")
    private double acGstRate;

    @Value("${app.booking.cancellation-fee:100.0}")
    private double defaultCancellationFee;

    public static class FareBreakdown {
        private final double baseFare;
        private final double reservationFee;
        private final double gst;
        private final double totalFare;

        public FareBreakdown(double baseFare, double reservationFee, double gst, double totalFare) {
            this.baseFare = baseFare;
            this.reservationFee = reservationFee;
            this.gst = gst;
            this.totalFare = totalFare;
        }

        public double getBaseFare() {
            return baseFare;
        }

        public double getReservationFee() {
            return reservationFee;
        }

        public double getGst() {
            return gst;
        }

        public double getTotalFare() {
            return totalFare;
        }
    }

    public FareBreakdown calculateFare(double distanceKm, CoachType coachType, int passengerCount) {
        if (distanceKm <= 0) {
            distanceKm = 100.0; // minimum distance
        }
        if (passengerCount <= 0) {
            passengerCount = 1;
        }

        // Distance * rate per km (minimum ₹120)
        double perPassengerBase = Math.max(120.0, distanceKm * coachType.getBaseRatePerKm());
        double totalBaseFare = round(perPassengerBase * passengerCount);

        double totalReservationFee = round(defaultReservationFee * passengerCount);

        // 5% GST on AC coaches (1A, 2A, 3A, CC), 0% on Sleeper / 2S
        boolean isAc = coachType == CoachType.FIRST_AC ||
                       coachType == CoachType.TWO_TIER_AC ||
                       coachType == CoachType.THREE_TIER_AC ||
                       coachType == CoachType.CHAIR_CAR;

        double totalGst = isAc ? round((totalBaseFare + totalReservationFee) * acGstRate) : 0.0;
        double totalFare = round(totalBaseFare + totalReservationFee + totalGst);

        return new FareBreakdown(totalBaseFare, totalReservationFee, totalGst, totalFare);
    }

    public double calculateCancellationRefund(double totalAmount, CoachType coachType) {
        double cancellationFee = switch (coachType) {
            case FIRST_AC -> 240.0;
            case TWO_TIER_AC -> 200.0;
            case THREE_TIER_AC, CHAIR_CAR -> 180.0;
            case SLEEPER -> 120.0;
            case SECOND_SEATING -> 60.0;
        };

        double refund = Math.max(0.0, totalAmount - cancellationFee);
        return round(refund);
    }

    public double getCancellationFee(CoachType coachType) {
        return switch (coachType) {
            case FIRST_AC -> 240.0;
            case TWO_TIER_AC -> 200.0;
            case THREE_TIER_AC, CHAIR_CAR -> 180.0;
            case SLEEPER -> 120.0;
            case SECOND_SEATING -> 60.0;
        };
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
