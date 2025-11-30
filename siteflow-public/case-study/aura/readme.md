# Aura – Organic Technology Platform
### A Siteflow Case Study

![Aura Banner](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000)

> **Kund:** Aura  
> **Utvecklare:** Siteflow  
> **Status:** Live / Production Ready  
> **Kategori:** E-handel / AI / Lifestyle

## 📋 Överblick

**Aura** är en e-handels- och livsstilsplattform utvecklad av **Siteflow** för att omdefiniera hur vi interagerar med teknik. Uppdraget var att skapa en digital upplevelse som speglar Auras fysiska produkter: tystlåten, organisk och intuitiv.

Plattformen kombinerar "Quiet Luxury"-estetik med avancerad AI-teknik för att skapa en köpresa som känns mer som en konversation än en transaktion.

---

## 🏢 Om Klienten: Aura

Aura är ett teknikvarumärke som utmanar den traditionella "black box"-estetiken inom hemelektronik. De tillverkar hörlurar, smarta klockor och luftrenare med material som sandsten, obehandlad aluminium och organisk bomull. Deras filosofi, *"Technology that feels like nature"*, krävde en webbplattform som prioriterar lugn, estetik och mental hälsa framför aggressiv försäljning.

---

## 🚀 Systemfunktionalitet & Siteflow-lösningen

Siteflow levererade en skräddarsydd Single Page Application (SPA) byggd på React och TypeScript. Nedan beskrivs systemets kärnkomponenter så som de fungerar i produktionsmiljö.

### 1. AI-Concierge (Powered by Google Gemini)
Istället för en traditionell sökfunktion eller FAQ, implementerade Siteflow en **AI-driven concierge**.
*   **Teknik:** Google Gemini 2.5 Flash API.
*   **Funktion:** Conciergen agerar varumärkesambassadör. Den förstår kontext, tonläge och produktspecifikationer.
*   **Exempel:** En kund kan fråga *"Jag känner mig stressad, vad rekommenderar du?"* och AI:n föreslår *Aura Essence* (luftrenare) eller *Aura Epoch* (klocka med stressmätare) med en lugnande motivering, snarare än bara en produktlänk.

### 2. "The Sanctuary" Dashboard
För inloggade medlemmar skapade vi en personlig dashboard som går bortom orderhistorik.
*   **Wellness Data:** Integrerar data från användarens Aura-enheter (t.ex. *Focus Time* från hörlurarna eller *Air Quality* från luftrenaren).
*   **Journeys:** En minimalistisk vy över tidigare beställningar och leveransstatus.
*   **Profil:** Hantering av prenumerationer för veckovisa "journals" och produktnyheter.

### 3. Sömlös E-handel
*   **Varukorg (Drawer):** En "non-intrusive" varukorg som glider in från sidan utan att störa upplevelsen.
*   **Checkout:** Ett avskalat, distraktionsfritt kassaflöde optimerat för konvertering men designat för lugn.

### 4. Redaktionellt Innehåll (The Journal)
En integrerad innehållsplattform där Aura publicerar artiklar om design, arkitektur och mindfulness. Detta bygger SEO-värde och fördjupar varumärkeslojaliteten.

---

## 🎨 Designfilosofi: "Digital Silence"

Siteflow arbetade utifrån konceptet "Digital Silence". Vi undvek skarpa kontraster, röda notis-bubblor och aggressiva "Call-to-Actions".

*   **Färgpalett:** Varma crèmetoner (`#F5F2EB`), mjukt kolgrått (`#2C2A26`) och sandstensbeige (`#D6D1C7`).
*   **Typografi:** En blandning av *Playfair Display* (Serif) för redaktionell elegans och *Inter* (Sans-serif) för funktionell tydlighet.
*   **Interaktion:** Mjuka animationer (fade-in-up) och långsamma hover-effekter som efterliknar fysisk tröghet.

---

## 🛠 Teknisk Stack

Projektet är byggt på en modern, skalbar arkitektur vald av Siteflow-teamet:

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Custom config för Aura-färgpalett)
*   **AI/LLM:** Google GenAI SDK (Gemini 2.5)
*   **Ikoner:** Heroicons (Minimalist outline style)
*   **Build Tool:** Vite

---

## ⚙️ Installation & Demo

För att köra denna Siteflow-demo lokalt:

1.  **Klona repot:**
    ```bash
    git clone https://github.com/siteflow/aura-case-study.git
    ```

2.  **Installera beroenden:**
    ```bash
    npm install
    ```

3.  **Konfigurera Miljövariabler:**
    Skapa en `.env` fil och lägg till din Google Gemini API nyckel (krävs för att Conciergen ska fungera):
    ```env
    API_KEY=din_google_gemini_nyckel_här
    ```

4.  **Starta applikationen:**
    ```bash
    npm start
    ```

---

*© 2025 Siteflow Digital Agency. All rights reserved.*
