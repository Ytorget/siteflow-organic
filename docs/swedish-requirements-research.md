# Swedish B2B Platform Requirements Research

## Executive Summary

This document provides comprehensive research on Swedish-specific requirements for building Siteflow, a B2B platform for the Swedish market. It covers legal requirements, cultural considerations, payment integrations, and compliance requirements as of 2025.

---

## 1. Swedish Organization Number (Organisationsnummer)

### Format and Structure

**Format:** `XXXXXX-XXXX` (10 digits with hyphen)

**Structure:**
- 10 digits total
- Last digit is a control digit (Luhn checksum)
- The "month" field (digits 3-4) is always ≥ 20 (distinguishes from personnummer)
- First 6 digits do NOT represent a date (unlike personnummer)

### Validation Algorithm

Swedish organisationsnummer uses the **Luhn algorithm (modulo 10)** for checksum validation.

### Elixir Implementation

```elixir
defmodule Siteflow.Validation.OrgNumber do
  @moduledoc """
  Validates Swedish organization numbers (organisationsnummer).
  """

  @doc """
  Validates a Swedish organization number using the Luhn algorithm.

  ## Examples

      iex> validate("556789-1234")
      {:ok, "5567891234"}

      iex> validate("556789-1235")
      {:error, "Invalid checksum"}

      iex> validate("551789-1234")
      {:error, "Invalid format: month must be >= 20"}
  """
  def validate(org_number) when is_binary(org_number) do
    with {:ok, normalized} <- normalize(org_number),
         :ok <- validate_format(normalized),
         :ok <- validate_checksum(normalized) do
      {:ok, normalized}
    end
  end

  defp normalize(org_number) do
    # Remove hyphen and whitespace
    normalized = String.replace(org_number, ~r/[\s-]/, "")

    if String.length(normalized) == 10 and String.match?(normalized, ~r/^\d{10}$/) do
      {:ok, normalized}
    else
      {:error, "Invalid format: must be 10 digits"}
    end
  end

  defp validate_format(org_number) do
    # Extract "month" (digits 3-4)
    month = org_number |> String.slice(2, 2) |> String.to_integer()

    if month >= 20 do
      :ok
    else
      {:error, "Invalid format: month must be >= 20 (this appears to be a personnummer)"}
    end
  end

  defp validate_checksum(org_number) do
    digits =
      org_number
      |> String.graphemes()
      |> Enum.map(&String.to_integer/1)

    if luhn_valid?(digits) do
      :ok
    else
      {:error, "Invalid checksum"}
    end
  end

  @doc """
  Implements the Luhn algorithm for checksum validation.
  """
  def luhn_valid?(digits) when is_list(digits) do
    digits
    |> Enum.reverse()
    |> Enum.with_index()
    |> Enum.map(fn {digit, index} ->
      if rem(index, 2) == 1 do
        # Double every second digit
        doubled = digit * 2
        if doubled > 9, do: doubled - 9, else: doubled
      else
        digit
      end
    end)
    |> Enum.sum()
    |> rem(10) == 0
  end

  @doc """
  Formats an organization number with hyphen.

  ## Examples

      iex> format("5567891234")
      "556789-1234"
  """
  def format(org_number) when is_binary(org_number) do
    normalized = String.replace(org_number, ~r/[\s-]/, "")

    if String.length(normalized) == 10 do
      first = String.slice(normalized, 0, 6)
      last = String.slice(normalized, 6, 4)
      "#{first}-#{last}"
    else
      org_number
    end
  end
end
```

### Public API for Lookup

**No free public API exists** for Swedish organization number lookups. Options include:

1. **Bolagsverket (Companies Registration Office)** - Official source but no free API
2. **allabolag.se** - Commercial service with API access (paid)
3. **Bisnode** - Commercial data provider (paid)
4. **UC AB** - Credit information company (paid)

For basic validation, use the Luhn algorithm above. For company details (name, address, etc.), you'll need a commercial API or manual lookup at allabolag.se.

---

## 2. Swedish Invoice Requirements (Faktura)

### Mandatory Fields for Swedish B2B Invoices

According to **Skatteverket (Swedish Tax Agency)** requirements:

#### Required Information:

1. **Supplier Information:**
   - Company name
   - Address
   - Organization number (organisationsnummer)
   - VAT registration number: `SE` + 10 digits + `01` (e.g., `SE5567891234 01`)

2. **Customer Information:**
   - Company name
   - Address
   - Organization number

3. **Invoice Details:**
   - Unique invoice number (sequential)
   - Invoice date
   - Delivery date or period
   - Payment terms (e.g., "30 dagar netto" = net 30 days)
   - Due date (förfallodatum)
   - Payment reference (OCR number or invoice number)

4. **Financial Information:**
   - Line items with description
   - Quantity and unit price
   - Subtotal (excluding VAT)
   - VAT rate (25% standard)
   - VAT amount **in SEK** (mandatory, even if invoice in foreign currency)
   - If foreign currency used: exchange rate and conversion to SEK for VAT
   - Total amount (including VAT)

5. **Payment Information:**
   - Bankgiro or Plusgiro number
   - Bank account number (if applicable)
   - IBAN and BIC for international payments

6. **Additional Requirements:**
   - "Reverse charge" notation if applicable (B2B cross-border)
   - Reference to contract or purchase order (if applicable)

### 2025 Updates

**From January 1, 2025:**
- Sweden refined VAT invoicing rules to align with EU VAT Directive
- New requirements for simplified invoices (≤ SEK 4,000 including VAT)
- All invoices must be archived for **7 years** (bookkeeping requirement)

### E-Invoice Format: Peppol BIS Billing 3.0

**Standard:** Sweden uses **Peppol BIS Billing 3.0** as the Core Invoice Usage Specification (CIUS)

**Key Dates:**
- **March 1, 2025:** Swedish Customs Authority adopts Peppol BIS Billing 3
- **April 6, 2025:** All customs invoices distributed via Peppol format
- **July 1, 2025:** Legacy formats (EDIFACT, Svefaktura) no longer supported for B2G

**Implementation:**
- No national-specific adaptations; Sweden uses OpenPeppol standard directly
- Fully compliant with European standard EN 16931
- Public sector required to receive Peppol e-invoices since November 1, 2019

### Invoice Template Example

```elixir
defmodule Siteflow.Invoices.SwedishInvoice do
  @moduledoc """
  Generates Swedish-compliant invoices.
  """

  defstruct [
    # Supplier info
    :supplier_name,
    :supplier_address,
    :supplier_org_number,
    :supplier_vat_number,  # SE5567891234 01
    :supplier_bankgiro,
    :supplier_plusgiro,

    # Customer info
    :customer_name,
    :customer_address,
    :customer_org_number,
    :customer_reference,

    # Invoice details
    :invoice_number,
    :invoice_date,
    :delivery_date,
    :due_date,
    :payment_terms,  # "30 dagar netto"
    :ocr_reference,

    # Line items
    :line_items,  # List of %{description, quantity, unit_price, vat_rate}

    # Totals
    :subtotal_sek,
    :vat_amount_sek,
    :total_sek,

    # Foreign currency (if applicable)
    :currency,
    :exchange_rate,
    :subtotal_foreign,
    :total_foreign,

    # Additional
    :notes,
    :reverse_charge
  ]

  @doc """
  Validates that all mandatory fields are present for Swedish compliance.
  """
  def validate(invoice) do
    required_fields = [
      :supplier_name, :supplier_org_number, :supplier_vat_number,
      :customer_name, :customer_org_number,
      :invoice_number, :invoice_date, :due_date, :payment_terms,
      :subtotal_sek, :vat_amount_sek, :total_sek
    ]

    missing = Enum.filter(required_fields, fn field ->
      Map.get(invoice, field) == nil
    end)

    if Enum.empty?(missing) do
      :ok
    else
      {:error, "Missing required fields: #{Enum.join(missing, ", ")}"}
    end
  end

  @doc """
  Calculates VAT (25% standard rate) and ensures amounts in SEK.
  """
  def calculate_totals(line_items, currency \\ "SEK", exchange_rate \\ 1.0) do
    subtotal = Enum.reduce(line_items, Decimal.new(0), fn item, acc ->
      Decimal.add(acc, Decimal.mult(item.quantity, item.unit_price))
    end)

    vat_amount = Decimal.mult(subtotal, Decimal.new("0.25"))
    total = Decimal.add(subtotal, vat_amount)

    # Convert to SEK if foreign currency
    subtotal_sek = Decimal.mult(subtotal, Decimal.new(to_string(exchange_rate)))
    vat_amount_sek = Decimal.mult(vat_amount, Decimal.new(to_string(exchange_rate)))
    total_sek = Decimal.mult(total, Decimal.new(to_string(exchange_rate)))

    %{
      subtotal: subtotal,
      vat_amount: vat_amount,
      total: total,
      subtotal_sek: subtotal_sek,
      vat_amount_sek: vat_amount_sek,
      total_sek: total_sek,
      currency: currency,
      exchange_rate: exchange_rate
    }
  end
end
```

### Invoice Numbering

**Format:** No strict format required, but must be:
- Unique
- Sequential (no gaps allowed)
- Not reused

**Recommendation:** Use format like `2025-0001`, `2025-0002`, etc.

---

## 3. Swedish Payment Methods

### Overview

Swedish B2B payments primarily use three methods:

1. **Bankgiro** (90% of B2B transaction value)
2. **Plusgiro** (integrated with Nordea)
3. **Swish** (for small/mid-size transactions, instant payments)

### Bankgiro

**What it is:**
- Clearing system for bank transfers
- Most Swedish businesses have a Bankgiro number
- Account-to-account transfers via bank network
- Processed through Bankgirot clearing house

**Format:**
- 7-8 digits, formatted as `XXX-XXXX` or `XXXX-XXXX`
- Example: `123-4567` or `5811-8179`

**Processing time:** 1-2 business days

**Use case:** Standard B2B invoicing, most common payment method

### Plusgiro

**What it is:**
- Originally PostGiro (postal service)
- Now managed by Nordea
- Similar to Bankgiro but different network
- Can transfer between Plusgiro and Bankgiro

**Format:**
- 2-8 digits, no hyphens
- Example: `12345678`

**Processing time:** 1-2 business days

**Use case:** B2B payments, especially for Nordea customers

### Swish

**What it is:**
- Mobile payment app (8 million users = 86% of Swedish population)
- Instant payments via BankID authentication
- Originally for C2C, now includes Swish Företag (business)

**Processing time:** Real-time (instant)

**Use case:** Small transactions, urgent payments, mobile-first

**Integration:**
- Requires Swish Business account
- API available through participating banks
- Stripe supports Swish payments

### Autogiro (Direct Debit)

**What it is:**
- Swedish direct debit system
- For recurring payments (subscriptions, ongoing contracts)

**Use case:** Monthly retainers, subscription services

### Major Infrastructure Changes (2025-2026)

**Critical Update:**
Bankgirot is replacing current infrastructure with a modern platform using **ISO 20022** standard.

**Timeline:**
- **2025:** Development and gradual rollout
- **Fall 2026:** Full transition of Bankgiro and Plusgiro payments
- **Mandatory from 2026:** Payee name required for all transfers

**Action Required:**
- Ensure payment files use ISO 20022 format
- Check ERP/accounting system compatibility
- Update integration to support new Bankgirot platform

### Recommended Payment Integration for Siteflow

**Strategy: Multi-Method Approach**

```
Primary: Bankgiro (invoices with 30-day payment terms)
Secondary: Swish (instant payments, smaller amounts)
Recurring: Autogiro (monthly subscriptions/retainers)
International: IBAN/SWIFT transfers
```

**Integration Options:**

1. **Stripe Sweden**
   - Supports Swish payments
   - Handles card payments
   - Does NOT directly support Bankgiro/Plusgiro
   - Best for: Instant payments, subscriptions

2. **Atlar** (B2B payment platform)
   - Provides API for Swedish BBANs, Plusgiro, Bankgiro
   - Manage payments over domestic schemes
   - Best for: Full Swedish payment integration

3. **Direct Bank Integration**
   - Connect to major Swedish banks (SEB, Nordea, Handelsbanken)
   - Most control but complex implementation
   - Requires separate agreements with each bank

**Recommendation for Siteflow:**

```elixir
# Hybrid approach
config :siteflow, :payments,
  # For instant payments and cards
  stripe: [
    enabled: true,
    methods: [:swish, :card]
  ],

  # For traditional B2B invoicing
  bankgiro: [
    enabled: true,
    number: "123-4567",
    # Manual reconciliation or use Atlar API
    integration: :atlar
  ],

  # For recurring payments
  autogiro: [
    enabled: true,
    # Requires bank agreement
    provider: :seb
  ]
```

**Implementation Priority:**

1. **Phase 1:** Bankgiro (manual reconciliation initially)
   - Display Bankgiro number on invoices
   - Manual payment verification via bank statement
   - Most critical for Swedish B2B

2. **Phase 2:** Stripe + Swish integration
   - Automated instant payments
   - Better UX for customers
   - Fallback for urgent payments

3. **Phase 3:** Autogiro for subscriptions
   - Requires bank agreement and setup
   - Ideal for recurring revenue

---

## 4. Swedish VAT (Moms)

### Standard Rate

**25%** - One of the highest in EU
- Applies to all digital services
- Applies to most goods and services
- No reduced rate for software/SaaS

### B2B Transactions (Reverse Charge)

**Domestic B2B (Sweden to Sweden):**
- Supplier charges 25% VAT on invoice
- Customer can reclaim input VAT
- Normal VAT treatment

**Cross-Border B2B (EU to Sweden):**
- **Reverse charge applies**
- Supplier does NOT charge VAT (0%)
- Customer self-accounts for VAT in Sweden
- Invoice must state: "Reverse charge - VAT to be accounted for by the recipient"

**Example:**
```
Supplier (Germany) → Customer (Sweden)
Invoice shows:
  Subtotal: €1,000
  VAT: €0 (Reverse charge)
  Note: "Reverse charge pursuant to Article 196 of EU VAT Directive"

Swedish customer must:
  - Account for Swedish VAT (25%) = SEK 2,500 (if €1,000 = SEK 10,000)
  - Can reclaim as input VAT if VAT-registered
```

### B2C Transactions

**No registration threshold** for foreign businesses selling to Swedish consumers.

**Requirement:**
- First B2C sale triggers VAT registration obligation
- Must charge 25% Swedish VAT
- Must register with Skatteverket

**For SaaS/Digital Services:**
- Always 25% VAT for Swedish B2C customers
- No exceptions for electronic services

### VAT Registration Number Format

**Format:** `SE` + 10 digits + `01`
- Example: `SE5567891234 01` (space before 01)
- Based on organization number
- `01` suffix indicates VAT registration

### 2025 VAT Updates

**From January 1, 2025:**
- VAT registration threshold increased from SEK 80,000 to SEK 120,000
- Applies to annual turnover

**Implementation:**

```elixir
defmodule Siteflow.Billing.VAT do
  @moduledoc """
  Handles Swedish VAT calculations and compliance.
  """

  @standard_rate Decimal.new("0.25")
  @registration_threshold_sek 120_000

  def calculate_vat(amount, customer) do
    cond do
      # B2B reverse charge (cross-border)
      cross_border_b2b?(customer) ->
        %{
          amount: Decimal.new(0),
          rate: Decimal.new(0),
          note: "Reverse charge - VAT to be accounted for by the recipient"
        }

      # Swedish B2B or B2C
      swedish_customer?(customer) ->
        %{
          amount: Decimal.mult(amount, @standard_rate),
          rate: @standard_rate,
          note: "Swedish VAT (moms) 25%"
        }

      # Non-EU B2B (outside scope)
      true ->
        %{
          amount: Decimal.new(0),
          rate: Decimal.new(0),
          note: "Outside scope of Swedish VAT"
        }
    end
  end

  defp cross_border_b2b?(customer) do
    customer.country != "SE" &&
    customer.country in eu_countries() &&
    customer.vat_number != nil &&
    customer.business_customer == true
  end

  defp swedish_customer?(customer) do
    customer.country == "SE"
  end

  defp eu_countries do
    ~w(AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE)
  end

  @doc """
  Checks if company needs to register for Swedish VAT.
  """
  def requires_vat_registration?(annual_revenue_sek) do
    Decimal.compare(annual_revenue_sek, @registration_threshold_sek) != :lt
  end
end
```

### VAT Reporting

**Frequency:**
- Monthly if annual turnover > SEK 40 million
- Quarterly if annual turnover ≤ SEK 40 million
- Annual for small businesses (option to apply)

**Deadline:**
- 26th of the month following the reporting period
- Electronic filing via Skatteverket portal

---

## 5. Swedish GDPR Requirements

### Legal Framework

Sweden implements GDPR through:
- **GDPR (EU Regulation 910/2014)** - Directly applicable
- **Data Protection Act (Dataskyddslagen)** - Swedish supplement
- Supervised by **IMY (Integritetsskyddsmyndigheten)** - Swedish Privacy Authority

### Key Differences from Standard GDPR

1. **Processing of Personal Identity Numbers (Personnummer):**
   - Additional restrictions in Swedish law
   - Generally requires "clear support in law" or explicit consent
   - Cannot be used solely for identification without valid reason

2. **Employee Data:**
   - Consent often inappropriate for employer-employee relationships
   - Must rely on other legal bases (contract, legitimate interest)
   - Specific guidelines from Swedish DPA

3. **Children's Data:**
   - Age of consent: **13 years** (lower than general GDPR minimum of 16)
   - Parental consent required for information society services

### Data Retention Requirements

**General Principle:**
- Retain data only as long as necessary for original purpose
- No blanket retention period

**Accounting/Bookkeeping Exception:**
- **7 years** retention for accounting documents (Bokföringslagen)
- Includes invoices, contracts, financial records

**Telecommunications Data:**
- Maximum **3 years** for data retention for law enforcement purposes

**Recommendation for Siteflow:**

```elixir
defmodule Siteflow.GDPR.RetentionPolicy do
  @moduledoc """
  Defines data retention periods for GDPR compliance.
  """

  @retention_periods %{
    # Accounting data - 7 years per Swedish law
    invoices: {:years, 7},
    contracts: {:years, 7},
    payment_records: {:years, 7},

    # Active customer data - while account active + 90 days
    customer_profiles: :while_active,
    project_data: :while_active,

    # Marketing data - until consent withdrawn
    marketing_consent: :until_withdrawn,

    # Support tickets - 3 years after resolution
    support_tickets: {:years, 3},

    # Access logs - 90 days
    access_logs: {:days, 90},

    # Backup data - 30 days
    backups: {:days, 30}
  }

  def retention_period(data_type) do
    Map.get(@retention_periods, data_type, :review_required)
  end

  @doc """
  Calculates deletion date based on retention policy.
  """
  def calculate_deletion_date(data_type, created_at) do
    case retention_period(data_type) do
      {:years, n} -> Timex.shift(created_at, years: n)
      {:days, n} -> Timex.shift(created_at, days: n)
      :while_active -> nil  # Manual review required
      :until_withdrawn -> nil  # Manual review required
      :review_required -> nil
    end
  end
end
```

### Right to Erasure (Right to be Forgotten)

**Implementation:**

1. **Soft Delete vs Hard Delete:**
   - Soft delete: Mark as deleted, retain for accounting period
   - Hard delete: Complete removal after retention period

2. **Exceptions:**
   - Cannot delete if legal obligation to retain (7-year accounting rule)
   - Cannot delete if needed for legal claims

**Recommended Approach:**

```elixir
defmodule Siteflow.GDPR.Erasure do
  @doc """
  Handles right to erasure requests.
  """
  def process_erasure_request(customer_id, requested_by) do
    customer = Customers.get!(customer_id)

    with :ok <- verify_identity(customer, requested_by),
         :ok <- check_deletion_eligibility(customer) do

      # Soft delete immediately
      Customers.soft_delete(customer)

      # Anonymize data that must be retained
      anonymize_accounting_data(customer)

      # Schedule hard delete after retention period
      schedule_hard_delete(customer, years: 7)

      # Notify customer
      send_confirmation_email(customer)

      {:ok, "Data marked for deletion"}
    end
  end

  defp check_deletion_eligibility(customer) do
    # Check for active contracts, unpaid invoices, etc.
    cond do
      has_active_projects?(customer) ->
        {:error, "Cannot delete: active projects exist"}

      has_unpaid_invoices?(customer) ->
        {:error, "Cannot delete: unpaid invoices exist"}

      true ->
        :ok
    end
  end

  defp anonymize_accounting_data(customer) do
    # Replace PII with anonymous identifiers
    # Keep financial records for 7 years
    Repo.update_all(
      from(i in Invoice, where: i.customer_id == ^customer.id),
      set: [
        customer_name: "DELETED CUSTOMER #{customer.id}",
        customer_email: "deleted@siteflow.se",
        customer_phone: nil,
        customer_contact_person: nil
      ]
    )
  end
end
```

### Data Processing Agreements (DPA)

**When Required:**
- When using third-party services that process customer data
- Subprocessors (hosting, email, analytics, etc.)

**Must Include:**
- Description of processing activities
- Purpose and duration
- Types of personal data
- Categories of data subjects
- Security measures
- Sub-processor authorization

**Siteflow Subprocessors to Document:**
- Cloud hosting provider (AWS, Google Cloud, etc.)
- Email service (SendGrid, Mailgun, etc.)
- Payment processor (Stripe)
- Analytics (if collecting personal data)
- Support tools (if storing customer data)

### Data Export (Portability)

**Requirement:**
- Provide customer data in structured, commonly used format
- Machine-readable (JSON, CSV, XML)

**Implementation:**

```elixir
defmodule Siteflow.GDPR.DataExport do
  @doc """
  Exports all customer data for portability request.
  """
  def export_customer_data(customer_id) do
    customer = Customers.get!(customer_id)

    %{
      personal_data: %{
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        organization_number: customer.org_number,
        address: customer.address,
        created_at: customer.inserted_at
      },
      projects: export_projects(customer_id),
      tickets: export_tickets(customer_id),
      invoices: export_invoices(customer_id),
      files: export_files(customer_id),
      consent_records: export_consents(customer_id)
    }
    |> Jason.encode!(pretty: true)
  end
end
```

### GDPR Compliance Checklist for Siteflow

- [ ] **Privacy Policy** in Swedish and English
- [ ] **Cookie Consent** banner (granular consent)
- [ ] **Data Processing Register** (internal documentation)
- [ ] **DPAs with all subprocessors**
- [ ] **Consent Management System** (record, withdraw, update)
- [ ] **Data Breach Notification Procedure** (72-hour reporting to IMY)
- [ ] **Data Protection Impact Assessment (DPIA)** if high-risk processing
- [ ] **Right to Access** implementation (customer portal)
- [ ] **Right to Erasure** implementation (deletion workflow)
- [ ] **Right to Portability** implementation (data export)
- [ ] **Data Retention Policy** documented and automated
- [ ] **Security Measures** (encryption, access controls, audit logs)
- [ ] **Staff Training** on GDPR compliance

---

## 6. Swedish E-Signature and BankID

### Legal Framework

**Regulation:** eIDAS Regulation (EU 910/2014)

**Swedish Implementation:**
- Managed by DIGG (Swedish Digital Administration Authority)
- BankID meets Trust Framework Level 3
- Recognized as **Advanced Electronic Signature** under eIDAS Article 25

### When E-Signatures Are Valid

**General Rule:**
- Contracts are valid without signatures in Swedish law
- Agreement between competent parties is sufficient
- Can be verbal, electronic, or paper

**E-Signature Requirements:**
- Uniquely identify the signatory
- Demonstrate intent and consent to sign
- Ensure document integrity

### BankID Overview

**What it is:**
- Electronic identification system
- Issued by Swedish banks
- Used by 8 million+ Swedes (nearly universal for adults)
- Meets Strong Customer Authentication (SCA) requirements under PSD2

**BankID Types:**
- **BankID on mobile** (most common)
- **BankID on file** (certificate on computer)
- **BankID on card** (physical card reader)

**Trust Level:**
- Level 3 (highest) per Swedish e-ID framework
- Advanced Electronic Signature per eIDAS
- Legally binding for most contracts

### Documents Requiring Traditional Signature

**Cannot use e-signature:**
- Wills and testamentary documents
- Share certificates
- Issue certificates
- Convertible instruments
- Employment termination notices

**Everything else:** E-signature with BankID is legally valid

### BankID Integration

**API Version:** v6.1 (latest as of 2025)

**Test Environment:**
- Base URL: `https://appapi2.test.bankid.com/rp/v6`
- Test certificate: Available at bankid.com/en/utvecklare/test
- Passphrase: `qwerty123`

**Production Environment:**
- Base URL: `https://appapi2.bankid.com/rp/v6`
- Requires production certificate from bank

**Key Changes in v6.0:**
- Removed `personalNumber` parameter from auth/sign requests
- Now uses animated QR codes for initiation
- More secure authentication flow

**Integration Options:**

1. **Direct API Integration** (most control)
   - Requires certificate management
   - Handle QR code generation
   - Implement polling for status

2. **Third-Party Broker** (easier)
   - Signicat (official BankID broker)
   - Criipto
   - Scrive (for document signing specifically)

**Elixir Integration Example:**

```elixir
defmodule Siteflow.BankID.Client do
  @moduledoc """
  Client for Swedish BankID integration (API v6).
  """

  @test_url "https://appapi2.test.bankid.com/rp/v6"
  @prod_url "https://appapi2.bankid.com/rp/v6"

  def authenticate(user_ip, options \\ []) do
    url = base_url() <> "/auth"

    body = %{
      endUserIp: user_ip,
      requirement: %{
        # Optional: require specific BankID type
        # cardReader: "class1",
        # certificatePolicies: ["1.2.3.4.25"]
      }
    }

    case HTTPoison.post(url, Jason.encode!(body), headers(), ssl_options()) do
      {:ok, %{status_code: 200, body: response_body}} ->
        response = Jason.decode!(response_body)
        {:ok, %{
          order_ref: response["orderRef"],
          auto_start_token: response["autoStartToken"],
          qr_start_token: response["qrStartToken"],
          qr_start_secret: response["qrStartSecret"]
        }}

      {:ok, %{status_code: status, body: error_body}} ->
        {:error, parse_error(error_body, status)}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def collect(order_ref) do
    url = base_url() <> "/collect"
    body = %{orderRef: order_ref}

    case HTTPoison.post(url, Jason.encode!(body), headers(), ssl_options()) do
      {:ok, %{status_code: 200, body: response_body}} ->
        response = Jason.decode!(response_body)

        case response["status"] do
          "complete" ->
            {:ok, %{
              status: :complete,
              user: %{
                personal_number: response["completionData"]["user"]["personalNumber"],
                name: response["completionData"]["user"]["name"],
                given_name: response["completionData"]["user"]["givenName"],
                surname: response["completionData"]["user"]["surname"]
              },
              signature: response["completionData"]["signature"],
              ocsp_response: response["completionData"]["ocspResponse"]
            }}

          "pending" ->
            {:ok, %{
              status: :pending,
              hint_code: response["hintCode"]
            }}

          "failed" ->
            {:error, response["hintCode"]}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  def sign(user_ip, user_visible_data, options \\ []) do
    url = base_url() <> "/sign"

    # userVisibleData must be Base64-encoded UTF-8
    encoded_data = Base.encode64(user_visible_data)

    body = %{
      endUserIp: user_ip,
      userVisibleData: encoded_data
      # Optional: userNonVisibleData for non-displayed data
    }

    case HTTPoison.post(url, Jason.encode!(body), headers(), ssl_options()) do
      {:ok, %{status_code: 200, body: response_body}} ->
        response = Jason.decode!(response_body)
        {:ok, %{
          order_ref: response["orderRef"],
          auto_start_token: response["autoStartToken"],
          qr_start_token: response["qrStartToken"],
          qr_start_secret: response["qrStartSecret"]
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def cancel(order_ref) do
    url = base_url() <> "/cancel"
    body = %{orderRef: order_ref}

    HTTPoison.post(url, Jason.encode!(body), headers(), ssl_options())
  end

  defp base_url do
    if Application.get_env(:siteflow, :env) == :prod do
      @prod_url
    else
      @test_url
    end
  end

  defp headers do
    [
      {"Content-Type", "application/json"},
      {"Accept", "application/json"}
    ]
  end

  defp ssl_options do
    [
      ssl: [
        certfile: Application.get_env(:siteflow, :bankid_cert_path),
        keyfile: Application.get_env(:siteflow, :bankid_key_path),
        # For test environment
        verify: :verify_peer,
        cacertfile: Application.get_env(:siteflow, :bankid_ca_path)
      ]
    ]
  end

  defp parse_error(error_body, status) do
    # Parse BankID error codes
    error = Jason.decode!(error_body)
    "BankID Error (#{status}): #{error["errorCode"]} - #{error["details"]}"
  end
end
```

**QR Code Generation (v6 requirement):**

```elixir
defmodule Siteflow.BankID.QRCode do
  @moduledoc """
  Generates animated QR codes for BankID v6.
  """

  def generate_qr_code(qr_start_token, qr_start_secret, time_elapsed_seconds) do
    # BankID v6 requires time-based QR code generation
    qr_auth_code = calculate_qr_auth_code(qr_start_secret, time_elapsed_seconds)

    # Format: bankid.{qrStartToken}.{timeElapsed}.{qrAuthCode}
    qr_data = "bankid.#{qr_start_token}.#{time_elapsed_seconds}.#{qr_auth_code}"

    # Generate QR code image
    qr_data
    |> QRCode.create()
    |> QRCode.render(:svg)
  end

  defp calculate_qr_auth_code(qr_start_secret, time_elapsed) do
    :crypto.hash(:sha256, "#{qr_start_secret}#{time_elapsed}")
    |> Base.encode16(case: :lower)
  end
end
```

### Contract Signing Workflow

**Typical Flow:**

1. **Prepare Document**
   ```elixir
   contract = Contracts.create_contract(%{
     customer_id: customer.id,
     type: "service_agreement",
     content: contract_html,
     status: "pending_signature"
   })
   ```

2. **Initiate BankID Signing**
   ```elixir
   user_visible_data = """
   Jag signerar serviceavtal #{contract.contract_number}
   mellan #{company_name} och #{customer.name}.

   Avtalsdatum: #{contract.date}
   Värde: #{contract.value} SEK
   """

   {:ok, sign_request} = BankID.Client.sign(
     customer.ip_address,
     user_visible_data
   )

   # Store order_ref for polling
   Contracts.update(contract, %{
     bankid_order_ref: sign_request.order_ref
   })
   ```

3. **Poll for Completion**
   ```elixir
   # Frontend polls every 2 seconds
   case BankID.Client.collect(order_ref) do
     {:ok, %{status: :complete, signature: signature, user: user}} ->
       # Store signature and mark complete
       Contracts.complete_signature(contract, %{
         signature: signature,
         signed_by: user.personal_number,
         signed_name: user.name,
         signed_at: DateTime.utc_now()
       })

     {:ok, %{status: :pending}} ->
       # Continue polling
       :pending

     {:error, reason} ->
       # Handle failure
       Contracts.fail_signature(contract, reason)
   end
   ```

4. **Audit Trail**
   ```elixir
   AuditLog.create(%{
     event: "contract_signed",
     contract_id: contract.id,
     signed_by: user.name,
     personal_number: user.personal_number,
     signature: signature,
     timestamp: DateTime.utc_now(),
     ip_address: customer.ip_address,
     ocsp_response: ocsp_response
   })
   ```

### Alternative E-Signature Solutions

**If BankID is too complex:**

1. **Scrive** (Swedish e-signature platform)
   - Built on BankID
   - Handles document storage
   - API integration available
   - Used by many Swedish companies

2. **DocuSign** (international)
   - Supports BankID
   - Global solution
   - More expensive

3. **Simple Click-to-Accept**
   - For low-value contracts
   - Store acceptance timestamp and IP
   - Less legally robust but simpler

**Recommendation for Siteflow:**

- **High-value contracts (>100k SEK):** BankID signing
- **Standard service agreements:** Scrive integration
- **Terms of Service acceptance:** Simple click-to-accept

---

## 7. Swedish Language Considerations

### Character Set

**Swedish Alphabet:**
- 29 letters: A-Z + Å, Ä, Ö
- Must support UTF-8 encoding throughout application
- Case-sensitive sorting differs from English

**Common Mistakes:**
- Å ≠ A (different letter)
- Ö ≠ O (different letter)
- Ä ≠ A (different letter)

**Implementation:**

```elixir
# Ensure database uses UTF-8
config :siteflow, Siteflow.Repo,
  encoding: "UTF8",
  collation: "sv_SE.UTF-8"  # Swedish collation

# Phoenix configuration
config :siteflow, SiteflowWeb.Endpoint,
  default_locale: "sv",
  locales: ["sv", "en"]
```

### Translation Structure

**Recommendation:** Use Gettext for internationalization

```elixir
# priv/gettext/sv/LC_MESSAGES/default.po
msgid "Welcome"
msgstr "Välkommen"

msgid "Project"
msgstr "Projekt"

msgid "Invoice"
msgstr "Faktura"

msgid "Payment terms"
msgstr "Betalningsvillkor"

msgid "Due date"
msgstr "Förfallodatum"

msgid "Organization number"
msgstr "Organisationsnummer"

msgid "VAT number"
msgstr "Momsregistreringsnummer"
```

### Email Templates in Swedish

**Subject Lines:**
- "Ny faktura från [Company]" (New invoice from...)
- "Påminnelse: Betalning förfaller [Date]" (Reminder: Payment due...)
- "Välkommen till [Service]" (Welcome to...)

**Formal vs Informal:**
- **Use "du"** (informal you) in B2B communication
- Swedish business culture is relatively informal
- First names common in communication

**Example Email Template:**

```elixir
defmodule Siteflow.Emails.Swedish do
  import Swoosh.Email

  def invoice_email(customer, invoice) do
    new()
    |> to({customer.name, customer.email})
    |> from({"Siteflow", "faktura@siteflow.se"})
    |> subject("Ny faktura #{invoice.invoice_number} från Siteflow")
    |> html_body("""
      <h2>Hej #{customer.contact_name},</h2>

      <p>Här kommer din faktura för #{invoice.period}.</p>

      <table>
        <tr>
          <td>Fakturanummer:</td>
          <td>#{invoice.invoice_number}</td>
        </tr>
        <tr>
          <td>Fakturadatum:</td>
          <td>#{format_date(invoice.invoice_date)}</td>
        </tr>
        <tr>
          <td>Förfallodatum:</td>
          <td>#{format_date(invoice.due_date)}</td>
        </tr>
        <tr>
          <td>Betalningsvillkor:</td>
          <td>30 dagar netto</td>
        </tr>
        <tr>
          <td><strong>Att betala:</strong></td>
          <td><strong>#{format_amount(invoice.total_sek)} SEK</strong></td>
        </tr>
      </table>

      <h3>Betalningsinformation</h3>
      <p>
        Bankgiro: #{Application.get_env(:siteflow, :bankgiro_number)}<br>
        OCR-nummer: #{invoice.ocr_reference}
      </p>

      <p>Fakturan finns även att ladda ner i din <a href="#{customer_portal_url()}">kundportal</a>.</p>

      <p>
        Med vänliga hälsningar,<br>
        Siteflow Team
      </p>

      <hr>
      <small>
        Siteflow AB | Organisationsnummer: #{Application.get_env(:siteflow, :org_number)}<br>
        #{Application.get_env(:siteflow, :address)}<br>
        Momsregistreringsnummer: #{Application.get_env(:siteflow, :vat_number)}
      </small>
    """)
  end

  defp format_date(date) do
    # Swedish date format: YYYY-MM-DD or "1 januari 2025"
    Timex.format!(date, "%Y-%m-%d", :strftime)
  end

  defp format_amount(amount) do
    # Swedish number format: 1 234,56 (space as thousand separator, comma as decimal)
    Number.Currency.number_to_currency(amount,
      unit: "",
      delimiter: " ",
      separator: ",",
      precision: 2
    )
  end
end
```

### Number Formatting

**Swedish Conventions:**
- **Thousand separator:** Space (not comma)
- **Decimal separator:** Comma (not period)
- **Currency:** SEK or kr (after amount)

**Examples:**
- English: 1,234.56
- Swedish: 1 234,56
- With currency: 1 234,56 kr eller 1 234,56 SEK

**Implementation:**

```elixir
defmodule Siteflow.Formatting.Swedish do
  @doc """
  Formats amount in Swedish number format.

  ## Examples

      iex> format_currency(1234.56)
      "1 234,56 kr"

      iex> format_currency(1000000)
      "1 000 000,00 kr"
  """
  def format_currency(amount) when is_number(amount) do
    amount
    |> :erlang.float_to_binary(decimals: 2)
    |> format_number()
    |> Kernel.<>(" kr")
  end

  defp format_number(number_string) do
    [integer_part, decimal_part] = String.split(number_string, ".")

    # Add space every 3 digits from right
    formatted_integer =
      integer_part
      |> String.reverse()
      |> String.graphemes()
      |> Enum.chunk_every(3)
      |> Enum.join(" ")
      |> String.reverse()

    "#{formatted_integer},#{decimal_part}"
  end
end
```

### Date Formatting

**Swedish Date Format:**
- ISO format: `YYYY-MM-DD` (2025-01-15)
- Long format: `15 januari 2025`
- Short format: `15 jan 2025`

**Month Names:**
```elixir
@swedish_months %{
  1 => "januari",
  2 => "februari",
  3 => "mars",
  4 => "april",
  5 => "maj",
  6 => "juni",
  7 => "juli",
  8 => "augusti",
  9 => "september",
  10 => "oktober",
  11 => "november",
  12 => "december"
}
```

---

## 8. Swedish Business Culture and Communication

### Communication Style

**Directness:**
- Swedes are very direct and value clarity
- "Klartext" (plain language) is appreciated
- Avoid corporate jargon and buzzwords
- Be straightforward about problems and limitations

**Example:**
- ❌ "We're experiencing some challenges with the delivery timeline..."
- ✅ "Projektet kommer bli försenat med två veckor." (The project will be delayed by two weeks.)

### Email Etiquette

**Greetings:**
- "Hej [Name]," (most common, informal but professional)
- "Hej," (if addressing multiple people or generic)
- Avoid "Dear" or overly formal salutations

**Sign-offs:**
- "Med vänliga hälsningar," (With kind regards - standard)
- "Mvh," (abbreviation, acceptable in ongoing conversations)
- "Vänligen," (Kindly - slightly more formal)
- "Tack på förhand," (Thanks in advance - when requesting something)

**Tone:**
- Professional but friendly
- Use first names (even with CEOs)
- "Du" (informal you) is standard, even in B2B
- Keep emails concise and to the point

### Response Time Expectations

**Email:**
- Standard: Within 24 hours (business days)
- Urgent: Same day
- Swedes value punctuality and reliability

**Meetings:**
- Always be on time (punctuality is critical)
- If running late, notify immediately

**Project Deadlines:**
- Keep your promises
- If delay is inevitable, communicate early and honestly
- Swedes prefer transparency over optimism

### Payment Behavior

**Standard Payment Terms:**
- **30 days net** is standard in Sweden
- Some companies negotiate 60 days
- Small businesses may prefer shorter terms (14 days)

**Late Payment:**
- Less common than in Southern Europe
- Swedish companies generally pay on time
- If payment is late, send reminder promptly
- Late payment interest is legal and commonly applied

**Reminder Sequence:**
```
Day 0: Invoice sent (due date +30 days)
Day 30: Invoice due
Day 35: Friendly reminder email
Day 45: Formal reminder with late fee notice
Day 60: Final notice before debt collection
Day 75: Hand over to collection agency (Inkasso)
```

### Contract Negotiation

**Characteristics:**
- **Patient and methodical** - Swedes take time to evaluate
- **Fact-based** - Provide data, case studies, references
- **Long-term perspective** - Value relationships over quick wins
- **Collaborative** - Seek win-win solutions
- **Avoid hard sell** - Aggressive tactics are counterproductive

**Decision-Making:**
- Often consensus-based
- May involve multiple stakeholders
- Decision process can take time
- Once decided, implementation is swift

### Work-Life Balance

**Important Cultural Value:**
- Swedes value work-life balance highly
- Expect out-of-office replies during vacations
- Summer vacations (July) are sacred
- Don't expect responses evenings/weekends
- Parental leave is common (both parents)

**Implications for Siteflow:**
- Offer flexible SLA options
- Be understanding of vacation schedules
- Provide self-service options for non-urgent matters

### Trust and Relationships

**Building Trust:**
- Demonstrate competence and reliability
- Be transparent about capabilities and limitations
- Follow through on commitments
- Respect their time and processes

**Long-Term Orientation:**
- Swedish businesses value long-term partnerships
- Less price-sensitive if value and trust are established
- Loyalty is earned through consistent delivery
- References from other Swedish companies are valuable

### Meeting Culture

**Virtual Meetings:**
- Very common (even pre-pandemic)
- Start on time, end on time
- Have clear agenda
- Expect equal participation (flat hierarchy)

**In-Person Meetings:**
- Coffee ("fika") is important but business-focused
- Small talk is minimal (get to point quickly)
- Handshake greeting is standard
- Business cards less common than in other cultures

---

## 9. Implementation Recommendations

### Priority Order for Siteflow

#### Phase 1: Legal Compliance (Critical)

1. **Organization Number Validation**
   - Implement Luhn algorithm validation
   - Format display with hyphen
   - Validate on customer creation

2. **Swedish Invoice Format**
   - All mandatory fields included
   - VAT number format: SE + 10 digits + 01
   - 7-year archival system
   - OCR number generation

3. **Bankgiro Payment Integration**
   - Display Bankgiro number on invoices
   - Manual reconciliation initially
   - Payment reference (OCR) system

4. **GDPR Compliance**
   - Privacy policy (Swedish + English)
   - Data retention policy (7 years accounting data)
   - Right to erasure workflow
   - Data export functionality

#### Phase 2: User Experience

1. **Swedish Language UI**
   - Complete Swedish translation
   - Swedish number formatting (1 234,56 kr)
   - Swedish date formatting
   - Email templates in Swedish

2. **Swish Integration (via Stripe)**
   - Instant payment option
   - Better UX for customers
   - Fallback for urgent payments

3. **BankID Contract Signing**
   - High-value contract signing
   - Or simpler: Scrive integration

#### Phase 3: Optimization

1. **Automated Payment Reconciliation**
   - API integration with bank or Atlar
   - Auto-match payments to invoices
   - OCR number matching

2. **Autogiro for Recurring Payments**
   - Direct debit for subscriptions
   - Requires bank agreement
   - Setup period: 2-3 months

3. **Peppol E-Invoice Support**
   - For public sector customers
   - Future-proofing for B2B mandate

### Key Configuration

```elixir
# config/config.exs
config :siteflow,
  # Company details
  company_name: "Siteflow AB",
  org_number: "556789-1234",
  vat_number: "SE5567891234 01",

  # Payment details
  bankgiro_number: "123-4567",
  # plusgiro_number: "12345678",  # Optional

  # Invoice settings
  invoice_prefix: "SF",
  payment_terms_days: 30,
  late_fee_rate: 0.08,  # 8% + Riksbank rate

  # GDPR settings
  data_retention_years: 7,
  accounting_retention_years: 7,

  # Localization
  default_locale: "sv",
  supported_locales: ["sv", "en"],
  timezone: "Europe/Stockholm",
  currency: "SEK",

  # BankID (when implemented)
  bankid_env: :test,  # or :production
  bankid_cert_path: "priv/certs/bankid_test.p12",
  bankid_ca_path: "priv/certs/bankid_ca.pem"

# VAT settings
config :siteflow, :vat,
  standard_rate: Decimal.new("0.25"),
  registration_threshold_sek: 120_000,
  apply_reverse_charge: true  # For cross-border B2B
```

### Database Schema Additions

```elixir
# Add to customers table
alter table(:customers) do
  add :org_number, :string  # Format: XXXXXX-XXXX
  add :vat_number, :string  # Format: SEXXXXXXXXXX 01
  add :bankgiro_number, :string
  add :plusgiro_number, :string
  add :preferred_payment_method, :string  # bankgiro, plusgiro, swish
  add :country, :string, default: "SE"
  add :eu_vat_registered, :boolean, default: false
end

# Add to invoices table
alter table(:invoices) do
  add :ocr_reference, :string  # For payment matching
  add :due_date, :date
  add :payment_terms_days, :integer, default: 30
  add :vat_rate, :decimal
  add :vat_amount_sek, :decimal
  add :subtotal_sek, :decimal
  add :total_sek, :decimal
  add :currency, :string, default: "SEK"
  add :exchange_rate, :decimal, default: 1.0
  add :reverse_charge, :boolean, default: false
  add :paid_at, :utc_datetime
  add :payment_method, :string  # bankgiro, swish, card, etc.
end

# Create payment_references table for OCR matching
create table(:payment_references) do
  add :invoice_id, references(:invoices)
  add :ocr_number, :string, null: false
  add :amount_expected_sek, :decimal
  add :reference_type, :string  # ocr, invoice_number, etc.

  timestamps()
end

# Create signature_audit_logs table
create table(:signature_audit_logs) do
  add :contract_id, references(:contracts)
  add :bankid_order_ref, :string
  add :signed_by_personal_number, :string
  add :signed_by_name, :string
  add :signature, :text  # Base64-encoded signature
  add :ocsp_response, :text
  add :ip_address, :string
  add :user_agent, :string
  add :signed_at, :utc_datetime

  timestamps()
end
```

---

## 10. Quick Reference

### Swedish Terms Glossary

| Swedish | English | Notes |
|---------|---------|-------|
| Faktura | Invoice | |
| Organisationsnummer | Organization number | 10 digits, format: XXXXXX-XXXX |
| Momsregistreringsnummer | VAT registration number | Format: SE + 10 digits + 01 |
| Moms | VAT | 25% standard rate |
| Betalningsvillkor | Payment terms | Usually "30 dagar netto" |
| Förfallodatum | Due date | |
| OCR-nummer | OCR reference | For automated payment matching |
| Bankgiro | Bankgiro | Bank transfer system |
| Plusgiro | Plusgiro | Postal giro system (now Nordea) |
| Swish | Swish | Mobile instant payment |
| Autogiro | Direct debit | For recurring payments |
| Bokföring | Bookkeeping/accounting | |
| Skatteverket | Swedish Tax Agency | |
| Bolagsverket | Companies Registration Office | |
| BankID | BankID | National e-ID system |
| Personnummer | Personal identity number | 10 digits, birth date based |
| Med vänliga hälsningar | With kind regards | Email sign-off |
| Klartext | Plain language | Communication style |

### Important Numbers

- **VAT Rate:** 25%
- **VAT Threshold:** 120,000 SEK annual turnover
- **Payment Terms:** 30 days (standard)
- **Late Payment Interest:** Riksbank rate + 8%
- **Accounting Retention:** 7 years
- **GDPR Data Retention:** As long as necessary (with 7-year exception for accounting)
- **BankID Users:** 8 million+ (86% of population)

### Key Regulatory Bodies

- **Skatteverket** (Swedish Tax Agency) - VAT, taxes
- **Bolagsverket** (Companies Registration Office) - Company registration
- **IMY (Integritetsskyddsmyndigheten)** - Data protection authority
- **DIGG** (Swedish Digital Administration Authority) - E-ID framework
- **Finansinspektionen** - Financial supervision
- **Bankgirot** - Payment clearing house

### Useful Links

- **BankID Developer:** https://www.bankid.com/en/utvecklare
- **Skatteverket (English):** https://www.skatteverket.se/servicelankar/otherlanguages/inenglishengelska.4.12815e4f14a62bc048f4edc.html
- **Bolagsverket (English):** https://bolagsverket.se/en
- **Peppol OpenPeppol:** https://peppol.org/
- **Organization Number Validation:** https://organisationsnummer.dev/

---

## Conclusion

Building a Swedish B2B platform requires attention to:

1. **Legal Compliance:** Organization number validation, invoice requirements, 7-year archival
2. **Payment Integration:** Bankgiro (primary), Swish (instant), Autogiro (recurring)
3. **VAT Handling:** 25% standard rate, reverse charge for cross-border B2B
4. **GDPR:** Data retention policies, right to erasure, data export
5. **E-Signatures:** BankID for legally binding signatures
6. **Language:** Swedish UI, proper formatting (1 234,56 kr), direct communication
7. **Culture:** Directness, punctuality, long-term relationships

The implementation should prioritize legal compliance first (Phase 1), followed by user experience enhancements (Phase 2), and finally optimization (Phase 3). The Elixir code examples provided demonstrate validation logic and integration patterns that can be directly incorporated into Siteflow's backend.

**Key Success Factors:**
- Swedish language throughout (not just translated UI)
- Proper number/date formatting (Swedish conventions)
- Clear, direct communication ("klartext")
- Reliable payment infrastructure (Bankgiro essential)
- GDPR-compliant data handling
- BankID integration for high-value contracts

By following these requirements and recommendations, Siteflow will be well-positioned to serve the Swedish B2B market professionally and compliantly.
