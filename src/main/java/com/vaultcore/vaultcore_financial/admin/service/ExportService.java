package com.vaultcore.vaultcore_financial.admin.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.admin.entity.AuditLog;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExportService {

    public byte[] exportAuditLogsToPdf(List<AuditLog> logs) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);

        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Audit Logs Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(Chunk.NEWLINE);

        // Table
        PdfPTable table = new PdfPTable(5); // 5 columns
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 3, 2, 2, 4, 3 });

        addTableHeader(table, "Time", "Admin", "Action", "Details", "IP");

        for (AuditLog log : logs) {
            table.addCell(log.getCreatedAt().toString());
            table.addCell(log.getAdminId());
            table.addCell(log.getAction());
            table.addCell(log.getDetails());
            table.addCell(log.getIpAddress() != null ? log.getIpAddress() : "N/A");
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    public byte[] exportAuditLogsToCsv(List<AuditLog> logs) {
        StringBuilder csv = new StringBuilder();
        csv.append("Time,Admin,Action,Target Type,Target ID,Details,IP\n");

        for (AuditLog log : logs) {
            csv.append(escape(log.getCreatedAt().toString())).append(",");
            csv.append(escape(log.getAdminId())).append(",");
            csv.append(escape(log.getAction())).append(",");
            csv.append(escape(log.getTargetType())).append(",");
            csv.append(escape(log.getTargetId())).append(",");
            csv.append(escape(log.getDetails())).append(",");
            csv.append(escape(log.getIpAddress())).append("\n");
        }

        return csv.toString().getBytes();
    }

    public byte[] exportTransactionsToPdf(List<Transaction> transactions) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate()); // Landscape for more columns
        PdfWriter.getInstance(document, out);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Transaction Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);

        addTableHeader(table, "Time", "User", "Type", "Amount", "Status", "Reference");

        for (Transaction tx : transactions) {
            table.addCell(tx.getCreatedAt().toString());
            table.addCell(tx.getKeycloakUserId());
            table.addCell(tx.getType().toString());
            table.addCell(tx.getAmount().toString());
            table.addCell(tx.getStatus().toString());
            table.addCell(tx.getReferenceId());
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    public byte[] exportTransactionsToCsv(List<Transaction> transactions) {
        StringBuilder csv = new StringBuilder();
        csv.append("Time,User,Type,Amount,Status,Reference,Description\n");

        for (Transaction tx : transactions) {
            csv.append(escape(tx.getCreatedAt().toString())).append(",");
            csv.append(escape(tx.getKeycloakUserId())).append(",");
            csv.append(escape(tx.getType().toString())).append(",");
            csv.append(escape(tx.getAmount().toString())).append(",");
            csv.append(escape(tx.getStatus().toString())).append(",");
            csv.append(escape(tx.getReferenceId())).append(",");
            csv.append(escape(tx.getDescription())).append("\n");
        }

        return csv.toString().getBytes();
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell();
            cell.setPhrase(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private String escape(String data) {
        if (data == null)
            return "";
        String escapedData = data.replaceAll("\"", "\"\"");
        return "\"" + escapedData + "\"";
    }
}
