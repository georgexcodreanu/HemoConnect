# 🩸 HemoConnect

> **Ecosistem digital centralizat dedicat eficientizării procesului de donare, gestiunii stocurilor și distribuției sângelui în timp real.**

---

## 📌 Prezentare Generală

**HemoConnect** reunește într-un singur punct comun cele trei entități critice implicate în lanțul transfuzional: **Spitalele**, **Centrele de Transfuzie** și **Donatorii**.

Prin centralizarea datelor și automatizarea fluxurilor operaționale, platforma reduce semnificativ timpul necesar identificării și alocării resurselor de sânge, transformând procedurile manuale, tradiționale, într-un flux digital proactiv.

---

## 🚀 Funcționalități Principale

* **Sincronizare în Timp Real:** Conectare directă între cererea transmisă de unitățile spitalicești și stocurile existente în centrele de transfuzie.
* **Smart Queue & Alocare Algoritmică:** Motor inteligent de prioritizare a solicitărilor și distribuție a pungilor de sânge în funcție de urgența și severitatea cazurilor clinice.
* **Modul Predictiv pentru Stocuri:** Mecanism capabil să anticipeze riscul de deficit pentru anumite grupe sanguine și să declanșeze măsuri preventive.
* **Sistem de Programare Automatizat:** Gestionarea eficientă a donatorilor prin calendar dedicat, asigurând respectarea automată a pauzelor medicale legale dintre donări.
* **Notificări și Alerte Direcționate:** Alertarea rapidă a donatorilor compatibili și eligibili în cazul situațiilor de urgență sau al crizelor de stoc.

---

## 🛠 Tehnologii & Arhitectură

Proiectul adoptă o arhitectură **Client-Server** robustă și scalabilă:

| Componentă | Tehnologie | Rol / Responsabilitate |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript | Interfață de utilizator modulară, dinamică și puternic tipizată |
| **Backend** | .NET 8 (C#) | RESTful API, logica algoritmilor de prioritizare și procesarea datelor |
| **Bază de Date** | Microsoft SQL Server | Stocare relațională securizată și interogări tranzacționale optimizate |
| **Securitate & Auth** | Google Firebase | Management securizat al identității și controlul accesului bazat pe roluri |

---

## 👥 Ecosistemul Utilizatorilor

* **🏥 Spitale:** Înregistrează cereri urgente de sânge, specifică gradul de gravitate clinică și monitorizează statusul alocării în timp real.
* **🏢 Centre de Transfuzii:** Gestionează stocurile de pungi de sânge, procesează unitățile recoltate și livrează resursele prin intermediul cozii de prioritizare.
* **🙋 Donatori:** Se programează la donare, își monitorizează istoricul și eligibilitatea medicală, primind notificări în caz de criză regională de sânge.
