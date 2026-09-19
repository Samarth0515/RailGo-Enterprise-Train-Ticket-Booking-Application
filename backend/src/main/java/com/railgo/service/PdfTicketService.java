package com.railgo.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.railgo.dto.BookingDto;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfTicketService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    public byte[] generateTicketPdf(BookingDto.BookingResponse booking) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color primaryBlue = new Color(37, 99, 235);
            Color darkNeutral = new Color(15, 23, 42);
            Color lightGray = new Color(248, 250, 252);
            Color borderGray = new Color(226, 232, 240);
            Color accentGreen = new Color(22, 163, 74);

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, primaryBlue);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, darkNeutral);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkNeutral);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkNeutral);
            Font pnrFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryBlue);
            Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, accentGreen);

            // Header Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{3, 2});
            headerTable.setSpacingAfter(15);

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.addElement(new Paragraph("RAILGO EXPRESS", titleFont));
            logoCell.addElement(new Paragraph("Electronic Reservation Slip (ERS) • IRCTC Partner", subtitleFont));
            headerTable.addCell(logoCell);

            PdfPCell pnrCell = new PdfPCell();
            pnrCell.setBorder(Rectangle.BOX);
            pnrCell.setBorderColor(primaryBlue);
            pnrCell.setBackgroundColor(lightGray);
            pnrCell.setPadding(8);
            Paragraph pnrPara = new Paragraph("PNR: " + booking.getPnr(), pnrFont);
            pnrPara.setAlignment(Element.ALIGN_RIGHT);
            pnrCell.addElement(pnrPara);
            Paragraph statusPara = new Paragraph("STATUS: " + booking.getStatus(), statusFont);
            statusPara.setAlignment(Element.ALIGN_RIGHT);
            pnrCell.addElement(statusPara);
            headerTable.addCell(pnrCell);

            document.add(headerTable);

            // Journey Info Table
            PdfPTable journeyTable = new PdfPTable(4);
            journeyTable.setWidthPercentage(100);
            journeyTable.setSpacingAfter(15);
            journeyTable.setWidths(new float[]{2, 2, 2, 2});

            addKeyValCell(journeyTable, "Train Number & Name", booking.getTrainNumber() + " - " + booking.getTrainName(), boldFont, normalFont);
            addKeyValCell(journeyTable, "Class", booking.getClassCode() + " (" + booking.getCoachType() + ")", boldFont, normalFont);
            addKeyValCell(journeyTable, "Booking Date", booking.getBookingDate().format(TIME_FORMATTER), boldFont, normalFont);
            addKeyValCell(journeyTable, "Journey Date", booking.getJourneyDate().format(DATE_FORMATTER), boldFont, normalFont);

            addKeyValCell(journeyTable, "From Station", booking.getFromStationName() + " (" + booking.getFromStationCode() + ")", boldFont, normalFont);
            addKeyValCell(journeyTable, "Departure Time", booking.getDepartureTime() + " hrs", boldFont, normalFont);
            addKeyValCell(journeyTable, "To Station", booking.getToStationName() + " (" + booking.getToStationCode() + ")", boldFont, normalFont);
            addKeyValCell(journeyTable, "Arrival Time", booking.getArrivalTime() + " hrs", boldFont, normalFont);

            document.add(journeyTable);

            // Passengers Section
            Paragraph passHeading = new Paragraph("Passenger Details", sectionTitleFont);
            passHeading.setSpacingAfter(6);
            document.add(passHeading);

            PdfPTable passTable = new PdfPTable(6);
            passTable.setWidthPercentage(100);
            passTable.setSpacingAfter(15);
            passTable.setWidths(new float[]{1, 4, 1.5f, 1.5f, 2, 2.5f});

            addTableHeader(passTable, "#", primaryBlue);
            addTableHeader(passTable, "Passenger Name", primaryBlue);
            addTableHeader(passTable, "Age", primaryBlue);
            addTableHeader(passTable, "Gender", primaryBlue);
            addTableHeader(passTable, "Coach", primaryBlue);
            addTableHeader(passTable, "Seat / Berth", primaryBlue);

            int idx = 1;
            for (BookingDto.PassengerResponse p : booking.getPassengers()) {
                addTableCell(passTable, String.valueOf(idx++), normalFont, borderGray);
                addTableCell(passTable, p.getName(), boldFont, borderGray);
                addTableCell(passTable, String.valueOf(p.getAge()), normalFont, borderGray);
                addTableCell(passTable, p.getGender(), normalFont, borderGray);
                addTableCell(passTable, p.getCoachNumber(), boldFont, borderGray);
                addTableCell(passTable, p.getSeatNumber() + " (" + (p.getSeatType() != null ? p.getSeatType() : "Berth") + ")", boldFont, borderGray);
            }
            document.add(passTable);

            // Fare Section
            Paragraph fareHeading = new Paragraph("Payment & Fare Breakdown", sectionTitleFont);
            fareHeading.setSpacingAfter(6);
            document.add(fareHeading);

            PdfPTable fareTable = new PdfPTable(2);
            fareTable.setWidthPercentage(100);
            fareTable.setSpacingAfter(20);
            fareTable.setWidths(new float[]{3, 2});

            addFareRow(fareTable, "Ticket Base Fare", "₹ " + String.format("%.2f", booking.getBaseFare()), normalFont);
            addFareRow(fareTable, "Reservation / IRCTC Charges", "₹ " + String.format("%.2f", booking.getReservationFee()), normalFont);
            addFareRow(fareTable, "Goods & Services Tax (GST 5%)", "₹ " + String.format("%.2f", booking.getGst()), normalFont);
            addFareRow(fareTable, "Total Amount Paid", "₹ " + String.format("%.2f", booking.getTotalAmount()), boldFont);
            if (booking.getPayment() != null) {
                addFareRow(fareTable, "Payment Mode / Txn ID", booking.getPayment().getPaymentMethod() + " (" + booking.getPayment().getTransactionId() + ")", normalFont);
            }
            document.add(fareTable);

            // Instructions Footer
            PdfPTable footerTable = new PdfPTable(1);
            footerTable.setWidthPercentage(100);
            PdfPCell footerCell = new PdfPCell();
            footerCell.setBackgroundColor(lightGray);
            footerCell.setBorderColor(borderGray);
            footerCell.setPadding(10);
            footerCell.addElement(new Paragraph("Important Passenger Instructions:", boldFont));
            footerCell.addElement(new Paragraph("1. Passengers must carry an original government-issued photo identity card (Aadhaar / Voter ID / Passport / Driving License).", subtitleFont));
            footerCell.addElement(new Paragraph("2. Report at the origin boarding station at least 30 minutes prior to scheduled departure.", subtitleFont));
            footerCell.addElement(new Paragraph("3. Cancellation is permissible up to chart preparation as per Railway refund rules.", subtitleFont));
            footerTable.addCell(footerCell);
            document.add(footerTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating ticket PDF", e);
        }

        return out.toByteArray();
    }

    private void addKeyValCell(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(6);
        cell.setBorderColor(new Color(226, 232, 240));
        Paragraph pLabel = new Paragraph(label.toUpperCase(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.GRAY));
        Paragraph pVal = new Paragraph(value, valFont);
        cell.addElement(pLabel);
        cell.addElement(pVal);
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String text, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color border) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBorderColor(border);
        table.addCell(cell);
    }

    private void addFareRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell cell1 = new PdfPCell(new Phrase(label, font));
        cell1.setPadding(5);
        cell1.setBorderColor(new Color(226, 232, 240));

        PdfPCell cell2 = new PdfPCell(new Phrase(value, font));
        cell2.setPadding(5);
        cell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell2.setBorderColor(new Color(226, 232, 240));

        table.addCell(cell1);
        table.addCell(cell2);
    }
}
