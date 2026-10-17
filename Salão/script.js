
"use strict";

const yearElement = document.getElementById("year");
const form = document.getElementById("bookingForm");
const nameInput = document.getElementById("customerName");
const phoneInput = document.getElementById("customerPhone");
const serviceSelect = document.getElementById("service");
const barberSelect = document.getElementById("barber");
const dateInput = document.getElementById("bookingDate");
const timeSelect = document.getElementById("bookingTime");
const notesInput = document.getElementById("customerNotes");
const summary = document.getElementById("bookingSummary");
const message = document.getElementById("bookingMessage");

const services = {
    "Corte tradicional": { price: 35, duration: 30 },
    "Degradê / Fade": { price: 40, duration: 40 },
    "Barba completa": { price: 25, duration: 25 },
    "Corte + barba": { price: 55, duration: 60 },
    "Sobrancelha": { price: 12, duration: 10 },
    "Corte infantil": { price: 30, duration: 30 }
};

yearElement.textContent = new Date().getFullYear();

function localDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.min = localDate();

function currency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);
}

function updateSummary() {
    const service = services[serviceSelect.value];

    if (!service) {
        summary.textContent =
            "Escolha um serviço para ver o resumo.";
        return;
    }

    summary.textContent =
        `Serviço: ${serviceSelect.value} | ` +
        `Valor: ${currency(service.price)} | ` +
        `Duração: ${service.duration} minutos.`;
}

function updateTimes() {
    const selectedDate = dateInput.value;
    const service = services[serviceSelect.value];

    timeSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um horário";
    timeSelect.appendChild(placeholder);
    timeSelect.disabled = true;

    if (!selectedDate || !service) {
        placeholder.textContent = "Selecione o serviço e a data";
        return;
    }

    if (selectedDate < localDate()) {
        placeholder.textContent = "Escolha uma data válida";
        return;
    }

    const date = new Date(`${selectedDate}T12:00:00`);
    const day = date.getDay();

    if (day === 0) {
        placeholder.textContent = "Fechado aos domingos";
        return;
    }

    const now = new Date();
    const today = selectedDate === localDate();
    let count = 0;

    // Horários demonstrativos: segunda a sábado,
    // das 09:00 às 18:00, com intervalos de 30 minutos.
    for (
        let minutes = 9 * 60;
        minutes + service.duration <= 18 * 60;
        minutes += 30
    ) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        const time =
            `${String(hours).padStart(2, "0")}:` +
            `${String(mins).padStart(2, "0")}`;

        if (today) {
            const slot = new Date();
            slot.setHours(hours, mins, 0, 0);

            if (slot <= now) continue;
        }

        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
        count++;
    }

    if (count === 0) {
        placeholder.textContent = "Não há horários disponíveis";
        return;
    }

    timeSelect.disabled = false;
}

serviceSelect.addEventListener("change", () => {
    updateSummary();
    updateTimes();
    message.textContent = "";
});

dateInput.addEventListener("change", () => {
    updateTimes();
    message.textContent = "";
});

document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
        serviceSelect.value = button.dataset.service;
        updateSummary();
        updateTimes();
        message.textContent = "";

        document.getElementById("agendamento").scrollIntoView({
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth"
        });

        serviceSelect.focus({ preventScroll: true });
    });
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    if (!form.reportValidity()) return;

    const service = services[serviceSelect.value];

    if (!service) {
        message.textContent = "Selecione um serviço válido.";
        return;
    }

    if (!dateInput.value || dateInput.value < localDate()) {
        message.textContent = "Selecione uma data válida.";
        return;
    }

    updateTimes();

    if (timeSelect.disabled || !timeSelect.value) {
        message.textContent =
            "Selecione uma data e um horário disponível.";
        return;
    }

    // Ainda não existe conexão com banco de dados.
    // Por isso, nenhuma reserva real é criada.
    message.textContent =
        "Formulário validado! Esta é uma demonstração: " +
        "seus dados não foram salvos e o horário não está reservado.";
});

updateSummary();
updateTimes();
