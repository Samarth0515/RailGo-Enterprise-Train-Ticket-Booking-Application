package com.railgo.service;

import com.railgo.entity.CoachType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class FareServiceTest {

    private FareService fareService;

    @BeforeEach
    void setUp() {
        fareService = new FareService();
        ReflectionTestUtils.setField(fareService, "defaultReservationFee", 40.0);
        ReflectionTestUtils.setField(fareService, "acGstRate", 0.05);
        ReflectionTestUtils.setField(fareService, "defaultCancellationFee", 100.0);
    }

    @Test
    @DisplayName("Should calculate fare correctly for 3A class with GST")
    void testCalculateFareFor3A() {
        double distanceKm = 192.0; // Mumbai to Pune
        FareService.FareBreakdown breakdown = fareService.calculateFare(distanceKm, CoachType.THREE_TIER_AC, 2);

        assertNotNull(breakdown);
        assertTrue(breakdown.getBaseFare() > 0);
        assertEquals(80.0, breakdown.getReservationFee()); // 40 * 2 passengers
        assertTrue(breakdown.getGst() > 0); // AC has 5% GST
        assertEquals(breakdown.getBaseFare() + breakdown.getReservationFee() + breakdown.getGst(), breakdown.getTotalFare(), 0.05);
    }

    @Test
    @DisplayName("Should calculate fare without GST for Sleeper class")
    void testCalculateFareForSleeper() {
        double distanceKm = 192.0;
        FareService.FareBreakdown breakdown = fareService.calculateFare(distanceKm, CoachType.SLEEPER, 1);

        assertNotNull(breakdown);
        assertEquals(40.0, breakdown.getReservationFee());
        assertEquals(0.0, breakdown.getGst()); // No GST on Sleeper
        assertEquals(breakdown.getBaseFare() + breakdown.getReservationFee(), breakdown.getTotalFare(), 0.05);
    }

    @Test
    @DisplayName("Should calculate cancellation refund deducting appropriate class fee")
    void testCalculateCancellationRefund() {
        double totalAmount = 1615.0;
        double refund = fareService.calculateCancellationRefund(totalAmount, CoachType.THREE_TIER_AC);

        // 3A fee is 180.0 -> refund = 1615 - 180 = 1435.0
        assertEquals(1435.0, refund, 0.05);
    }
}
