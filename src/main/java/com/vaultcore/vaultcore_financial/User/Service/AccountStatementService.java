package com.vaultcore.vaultcore_financial.User.Service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.User.Repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AccountStatementService {

    private final TransactionRepository transactionRepository;

    public AccountStatementService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /* ---------------- TOTALS ---------------- */

    public BigDecimal getTotalDebit(String keycloakUserId) {
        return transactionRepository
                .findByKeycloakUserIdAndType(keycloakUserId, TransactionType.DEBIT)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalCredit(String keycloakUserId) {
        return transactionRepository
                .findByKeycloakUserIdAndType(keycloakUserId, TransactionType.CREDIT)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /* ---------------- MONTHLY PDF ---------------- */

    public byte[] generateMonthlyStatementPdf(
            String keycloakUserId,
            int month,
            int year
    ) {

        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);

        List<Transaction> transactions =
                transactionRepository.findByKeycloakUserIdAndCreatedAtBetween(
                        keycloakUserId, start, end
                );

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            /* -------- TITLE -------- */
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph(
                    "VaultCore Monthly Account Statement",
                    titleFont
            );
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(
                    "Statement Period: " + Month.of(month) + " " + year
            ));
            document.add(new Paragraph("Generated on: " + LocalDate.now()));
            document.add(new Paragraph(" "));

            /* -------- TABLE -------- */
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            addHeader(table, "Date");
            addHeader(table, "Time");
            addHeader(table, "Type");
            addHeader(table, "Amount");
            addHeader(table, "From Account");
            addHeader(table, "To Account");
            addHeader(table, "Status");

            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

            for (Transaction tx : transactions) {
                table.addCell(tx.getCreatedAt().toLocalDate().format(dateFmt));
                table.addCell(tx.getCreatedAt().toLocalTime().format(timeFmt));
                table.addCell(tx.getType().name());
                table.addCell(tx.getAmount().toPlainString());
                table.addCell(
                        tx.getFromAccountId() != null
                                ? tx.getFromAccountId().toString()
                                : "-"
                );
                table.addCell(
                        tx.getToAccountId() != null
                                ? tx.getToAccountId().toString()
                                : "-"
                );
                table.addCell(tx.getStatus().name());
            }

            document.add(table);
            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate statement PDF", e);
        }
    }

    /* ---------------- HELPERS ---------------- */

    private void addHeader(PdfPTable table, String text) {
        Font font = new Font(Font.HELVETICA, 10, Font.BOLD);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }
}
