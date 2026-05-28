"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import InvoiceModal, { InvoiceRecord } from "../../components/admin/InvoiceModal";

const SAMPLE_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-1",
    servicio: "Consulta general",
    propietario: "Ana Pérez",
    mascota: "Max",
    importe: "45",
    fecha: new Date().toISOString().split("T")[0],
    estado: "Pagado",
  },
  {
    id: "inv-2",
    servicio: "Vacunación"
    , propietario: "Carlos Ruiz",
    mascota: "Luna",
    importe: "60",
    fecha: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split("T")[0],
    estado: "Pendiente",
  },
];

const OWNER_NAMES = ["Ana Pérez", "Carlos Ruiz", "Mariana Soto", "Diego López"];
const PET_NAMES = ["Max", "Luna", "Oreo", "Bella"];

export default function FacturacionPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("vetnova-admin-invoices");
    if (raw) {
      setInvoices(JSON.parse(raw));
      return;
    }
    setInvoices(SAMPLE_INVOICES);
  }, []);

  const saveInvoices = (nextInvoices: InvoiceRecord[]) => {
    setInvoices(nextInvoices);
    window.localStorage.setItem("vetnova-admin-invoices", JSON.stringify(nextInvoices));
  };

  const handleSaveInvoice = (invoice: InvoiceRecord) => {
    const exists = invoices.some((item) => item.id === invoice.id);
    const nextInvoices = exists ? invoices.map((item) => (item.id === invoice.id ? invoice : item)) : [invoice, ...invoices];
    saveInvoices(nextInvoices);
  };

  const totalPayments = invoices.reduce((sum, invoice) => sum + Number(invoice.importe), 0);
  const pendingCount = invoices.filter((invoice) => invoice.estado === "Pendiente").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="lg:order-2">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Facturación</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Gestión de facturas</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Genera facturas, controla ingresos y mantén el seguimiento de pagos pendientes.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(37,99,235,0.22)] transition duration-300 hover:bg-blue-700"
                >
                  Nueva factura
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Ingresos totales</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Monto total registrado en el periodo actual.</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">${totalPayments.toFixed(2)}</p>
                </article>
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pagos pendientes</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Facturas por cobrar aún no pagadas.</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{pendingCount}</p>
                </article>
              </div>

              <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-200/80 bg-white px-6 py-5 dark:border-slate-700 dark:bg-slate-950">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Historial de facturas</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Registros recientes con estado y monto.</p>
                </div>
                <div className="divide-y divide-slate-200/80 dark:divide-slate-700">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{invoice.servicio}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{invoice.propietario} · {invoice.mascota}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{invoice.fecha}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">${Number(invoice.importe).toFixed(2)}</p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${invoice.estado === "Pagado" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {invoice.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        owners={OWNER_NAMES}
        pets={PET_NAMES}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvoice}
      />
    </div>
  );
}
