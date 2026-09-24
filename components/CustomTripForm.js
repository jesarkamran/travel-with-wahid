"use client";
/* The custom trip request.

   Where, when, how many — filed on the custom-trips tab of the bookings sheet
   as "requested", against the email given. No advance and no receipt: Wahid
   plans it, sends a price on WhatsApp, and moves the row to "approved", which
   shows under "Check a booking" with the same email.

   The rules live in lib/booking.js (validateCustom, requestCustom); the field
   shape is the booking form's own. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { destinations, site, tours } from "@/data/site";
import { Reveal } from "./motion";
import { Field } from "./BookingForm";
import { customMessage, newRef, recall, requestCustom, validateCustom, waHref } from "@/lib/booking";

const GROUPS = ["Friends", "Family", "University society or batch", "Office or team", "Other"];
const PLACES = [...tours.map((t) => t.title), ...destinations.map((d) => d.name)];

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  destination: "",
  groupType: GROUPS[0],
  people: "",
  start: "",
  days: 3,
  budget: "",
  pickup: "",
  notes: "",
};

export default function CustomTripForm() {
  const calm = useReducedMotion();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null); // { ref, saved, why }
  const [today, setToday] = useState("");

  // after mount: what this device remembers from a booking, and today's date
  // (read here, not in render, so the server and the browser agree on markup)
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-CA"));
    const me = recall();
    if (me) setForm((f) => ({ ...f, name: me.name || "", email: me.email || "", phone: me.phone || "", pickup: me.pickup || "" }));
  }, []);

  const errors = validateCustom(form);
  const show = (k) => (touched[k] || touched.$all) && errors[k];
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }));
  const input = (k, props) => ({
    id: `ct-${k}`,
    name: k,
    value: form[k],
    onChange: (e) => set(k, props?.type === "number" ? parseInt(e.target.value, 10) || "" : e.target.value),
    onBlur: () => blur(k),
    "aria-invalid": Boolean(show(k)),
    ...props,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched((t) => ({ ...t, $all: true }));
    if (Object.keys(errors).length) {
      const first = document.querySelector('.bk [aria-invalid="true"]');
      first?.focus();
      first?.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
      return;
    }
    setSending(true);
    const ref = newRef();
    const row = await requestCustom(form, ref);
    setDone({ ref, saved: row.ok, why: row.reason });
    setSending(false);
  };

  if (done) {
    const wa = waHref(site.phone, customMessage(form, done.ref));
    return (
      <Reveal className="bk bk--done">
        <p className="bk__tick" aria-hidden="true">
          {done.saved ? <Check size={26} /> : <AlertCircle size={26} />}
        </p>
        <h2>{done.saved ? "Request sent." : "Send it on WhatsApp."}</h2>
        <p className="bk__ref">{done.ref}</p>

        {done.saved ? (
          <p className="bk__saidit">
            Filed as <b>{done.ref}</b>, status <b>requested</b>. Wahid will plan it and send
            you a route and a price on WhatsApp. Once he approves it the status changes to{" "}
            <b>approved</b> — check it any time under <b>Check a booking</b> with{" "}
            <b>{String(form.email).trim().toLowerCase()}</b>.
          </p>
        ) : (
          <p className="bk__saved">
            <AlertCircle size={15} aria-hidden="true" />
            <span>
              <b>We could not file your request.</b>{" "}
              {done.why === "no-endpoint"
                ? "The booking records are not connected yet."
                : done.why === "unreachable"
                  ? "We could not reach the booking system."
                  : "The booking system turned the request away."}{" "}
              Nothing is lost — the button below opens WhatsApp with the whole request
              written out. Quote <b>{done.ref}</b>.
            </span>
          </p>
        )}

        <div className="bk__after">
          <a className="btn btn--wa" href={wa} target="_blank" rel="noopener">
            {done.saved ? "Message Wahid about it" : "Send on WhatsApp"}
          </a>
          {done.saved && (
            <Link className="btn btn--quiet" href="/book?check">
              Check my request
            </Link>
          )}
        </div>
      </Reveal>
    );
  }

  return (
    <form className="bk" onSubmit={onSubmit} noValidate>
      <fieldset className="bk__set" disabled={sending}>
        <legend className="bk__legend">The trip</legend>

        <Field id="ct-destination" label="Where to" error={show("destination")} hint="Pick one of ours or name your own.">
          <input {...input("destination", { type: "text", list: "ct-places", placeholder: "Kumrat valley" })} />
          <datalist id="ct-places">
            {PLACES.map((p) => <option key={p} value={p} />)}
          </datalist>
        </Field>

        <div className="bk__row">
          <Field id="ct-start" label="Start date" error={show("start")}>
            <input {...input("start", { type: "date", min: today || undefined })} />
          </Field>
          <Field id="ct-days" label="Days" error={show("days")}>
            <input {...input("days", { type: "number", min: 1, max: 30 })} />
          </Field>
        </div>

        <div className="bk__row">
          <Field id="ct-people" label="How many people" error={show("people")}>
            <input {...input("people", { type: "number", min: 1, placeholder: "12" })} />
          </Field>
          <Field id="ct-groupType" label="Who is going">
            <select {...input("groupType")}>
              {GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        <div className="bk__row">
          <Field id="ct-budget" label="Budget per person (PKR)" optional>
            <input {...input("budget", { type: "number", min: 0, step: 500, placeholder: "15000" })} />
          </Field>
          <Field id="ct-pickup" label="Pickup" optional>
            <input {...input("pickup", { type: "text", placeholder: "Islamabad" })} />
          </Field>
        </div>

        <Field id="ct-notes" label="What should it include" optional>
          <textarea
            {...input("notes", {
              rows: 3,
              placeholder: "Stays, meals, a guide, a bonfire night, places you must see…",
            })}
          />
        </Field>
      </fieldset>

      <fieldset className="bk__set" disabled={sending}>
        <legend className="bk__legend">Who is asking</legend>

        <Field id="ct-name" label="Full name" error={show("name")}>
          <input {...input("name", { type: "text", autoComplete: "name" })} />
        </Field>

        <div className="bk__row">
          <Field id="ct-email" label="Email" error={show("email")} hint="Your request is filed under this.">
            <input {...input("email", { type: "email", inputMode: "email", autoComplete: "email", placeholder: "you@example.com" })} />
          </Field>
          <Field id="ct-phone" label="WhatsApp number" error={show("phone")}>
            <input {...input("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "0300 1234567" })} />
          </Field>
        </div>
      </fieldset>

      <div className="bk__send">
        <button type="submit" className="btn btn--book bk__go" disabled={sending}>
          {sending ? (
            <>
              <Loader2 size={17} className="bk__spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>Send trip request</>
          )}
        </button>
        <p className="bk__small">
          Nothing is charged here. Wahid replies on WhatsApp with a plan and a price.
        </p>
      </div>
    </form>
  );
}
