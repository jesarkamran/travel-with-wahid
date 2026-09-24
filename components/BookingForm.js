"use client";
/* The booking form.

   The shape of it follows how the trips actually get sold: people pay the
   advance on WhatsApp first, then come here to log it. The receipt never
   touches this form — it goes into the same WhatsApp thread as the booking,
   where people already know how to send one. The email is the key: it ties a
   second booking to the same person in the people sheet, and it is what the
   traveller quotes when they ask where their seat went.

   All the rules live in lib/booking.js. This file only renders them, and only
   shows an error once the field has been left alone — telling someone their
   email is wrong while they are still typing it is just noise. */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Check, Loader2, UserCheck } from "lucide-react";
import { site } from "@/data/site";
import { money } from "./fmt";
import { Reveal } from "./motion";
import {
  forget,
  handoff,
  lookupPerson,
  mirror,
  newRef,
  recall,
  remember,
  total,
  validate,
  waHref,
  waMessage,
} from "@/lib/booking";

const EASE = [0.22, 0.8, 0.3, 1];

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  city: "",
  institution: "",
  seats: 1,
  pickup: "",
  notes: "",
  agree: false,
};

export default function BookingForm({ trip }) {
  const calm = useReducedMotion();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null); // { ref }
  const [failed, setFailed] = useState(""); // the one thing that went wrong

  // who we already know this is: 'device' (remembered here) or 'sheet' (looked up)
  const [known, setKnown] = useState(null);
  // kept in refs, not state, so neither can retrigger the lookup effect below
  const fromDevice = useRef(false);
  const askedFor = useRef("");

  /* This device first. Reading storage during render would mean the server and
     the browser disagreed about the markup, so it happens after mount. */
  useEffect(() => {
    const me = recall();
    if (!me) return;
    fromDevice.current = true;
    setForm((f) => ({ ...f, ...me, seats: f.seats }));
    setKnown({ via: "device", name: me.name });
    lookupPerson(me.email, { trip: trip.slug }).then((hit) => {
      if (hit?.booked) setKnown((k) => ({ ...(k || {}), booked: hit.booked }));
    });
  }, [trip.slug]);

  /* Then the sheet, for someone booking from a new phone. Only once the address
     looks finished, abandoned if they keep typing, and never asked twice for
     the same address — the effect depends on the email alone, so its own
     result cannot bring it round again. */
  const email = form.email;
  useEffect(() => {
    if (fromDevice.current) return;
    const clean = String(email || "")
      .trim()
      .toLowerCase();
    if (!clean.includes("@")) {
      askedFor.current = "";
      setKnown(null);
      return;
    }
    if (askedFor.current === clean) return;
    const ac = new AbortController();
    const t = setTimeout(async () => {
      askedFor.current = clean;
      const hit = await lookupPerson(clean, {
        trip: trip.slug,
        signal: ac.signal,
      });
      if (ac.signal.aborted) return;
      if (!hit) {
        setKnown(null);
        return;
      }
      // fill only what was empty — never overwrite something they just typed
      setForm((f) => ({
        ...f,
        name: f.name || hit.name || "",
        city: f.city || hit.city || "",
        institution: f.institution || hit.institution || "",
      }));
      setKnown({
        via: "sheet",
        name: hit.name,
        bookings: hit.bookings,
        booked: hit.booked,
      });
    }, 600);
    return () => {
      ac.abort();
      clearTimeout(t);
    };
  }, [email]);

  const held = known?.booked || null; // a live seat they already hold here
  const seatsLeft = Math.max(
    (trip.seats ?? site.seatsPerVan) - (trip.filled ?? 0),
    0,
  );
  const errors = validate(form, { seatsLeft });
  const show = (k) => (touched[k] || touched.$all) && errors[k];

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFailed("");
  };
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched((t) => ({ ...t, $all: true }));
    if (held) {
      setFailed(
        `That email already holds ${held.ref} on this trip. Message Wahid if you need another seat.`,
      );
      return;
    }
    if (Object.keys(errors).length) {
      // put the cursor where the first problem is
      const first = document.querySelector('.bk [aria-invalid="true"]');
      first?.focus();
      first?.scrollIntoView({
        block: "center",
        behavior: calm ? "auto" : "smooth",
      });
      return;
    }
    setSending(true);
    setFailed("");
    const ref = newRef();
    try {
      /* WhatsApp first, and nothing awaited before it: a share sheet has to
         come straight out of this tap, and an await in between spends that
         permission. The sheet mirror is a bonus, so it goes after. */
      const out = handoff({ form, trip, ref, phone: site.phone });
      remember(form);
      if (out.via === "blocked") {
        setFailed(
          "Your browser blocked the WhatsApp window. Allow pop-ups, or use the button below.",
        );
      }
      const row = await mirror(form, trip, ref);
      if (row.reason === "already-booked") {
        setDone({
          ref: row.ref,
          url: out.url,
          saved: true,
          already: true,
          status: row.status,
        });
        return;
      }
      setDone({ ref, url: out.url, saved: row.ok, why: row.reason });
    } catch {
      setFailed(
        "Could not open WhatsApp. Use the button below to send it by hand.",
      );
      const row = await mirror(form, trip, ref);
      setDone({
        ref,
        saved: row.ok,
        why: row.reason,
        url: waHref(site.phone, waMessage(form, trip, ref)),
      });
    } finally {
      setSending(false);
    }
  };

  /* Done. The reference is the whole point of this screen — it is what they
     quote on WhatsApp, so it is the biggest thing on it. */
  if (done) {
    return (
      <Reveal className="bk bk--done">
        <p className="bk__tick" aria-hidden="true">
          <Check size={26} />
        </p>
        <h2>Sent to Wahid.</h2>
        <p className="bk__ref">{done.ref}</p>

        <p className="bk__saidit">
          <strong>Now send your payment receipt in that chat.</strong> A
          screenshot is fine. Wahid matches it to this reference and confirms
          the seat — usually the same day. Nothing is charged on this page.
        </p>

        <p className={`bk__saved${done.saved ? " is-on" : ""}`}>
          {done.already ? (
            <>
              <Check size={15} aria-hidden="true" />
              <span>
                You already had a seat on this trip — <b>{done.ref}</b>, status{" "}
                <b>{done.status}</b>. Nothing new was created, so you have not
                been booked twice.
              </span>
            </>
          ) : done.saved ? (
            <>
              <Check size={15} aria-hidden="true" />
              <span>
                Booked into the system as <b>{done.ref}</b>, status{" "}
                <b>pending</b>. Once Wahid has checked your receipt he moves it
                to <b>booked</b> and your seat is held.
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={15} aria-hidden="true" />
              <span>
                <b>We could not save your booking details.</b>{" "}
                {done.why === "no-endpoint"
                  ? "The booking records are not connected yet."
                  : done.why === "forbidden"
                    ? "The booking system turned the request away."
                    : done.why === "refused"
                      ? "The booking system would not accept it."
                      : "We could not reach the booking system."}{" "}
                Nothing is lost — your details are in the WhatsApp message, so
                send that with your receipt and Wahid will enter it by hand.
                Quote <b>{done.ref}</b>.
              </span>
            </>
          )}
        </p>

        <div className="bk__after">
          <a
            className="btn btn--wa"
            href={
              done.url || waHref(site.phone, waMessage(form, trip, done.ref))
            }
            target="_blank"
            rel="noopener"
          >
            Open WhatsApp again
          </a>
          <Link className="btn btn--quiet" href="/tours">
            Back to trips
          </Link>
        </div>
      </Reveal>
    );
  }

  const amount = total(trip.price, form.seats);

  return (
    <form className="bk" onSubmit={onSubmit} noValidate>
      <fieldset className="bk__set" disabled={sending}>
        <legend className="bk__legend">Who is coming</legend>

        <AnimatePresence>
          {known && (
            <motion.p
              className={`bk__known${held ? " is-held" : ""}`}
              initial={calm ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <UserCheck size={15} aria-hidden="true" />
              <span>
                {held ? (
                  <>
                    You already have a seat on this trip — <b>{held.ref}</b> (
                    {held.status}). Open <b>Check a booking</b> above to see it,
                    or message Wahid to change the number of seats.
                  </>
                ) : known.via === "device" ? (
                  <>
                    Welcome back
                    {known.name ? `, ${known.name.split(" ")[0]}` : ""} — we
                    filled this in from your last booking.
                  </>
                ) : (
                  <>
                    We have you on file
                    {known.bookings > 1 ? ` from ${known.bookings} trips` : ""}.
                    Just your number to go.
                  </>
                )}
              </span>
              <button
                type="button"
                className="bk__known-x"
                onClick={() => {
                  forget();
                  fromDevice.current = false;
                  askedFor.current = "";
                  setKnown(null);
                  setTouched({});
                  // the seat count is theirs, whoever they are
                  setForm((f) => ({
                    ...EMPTY,
                    seats: f.seats,
                    agree: f.agree,
                  }));
                }}
              >
                Not me
              </button>
            </motion.p>
          )}
        </AnimatePresence>

        <Field id="name" label="Full name" error={show("name")}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={Boolean(show("name"))}
            placeholder="As on your ID card"
          />
        </Field>

        <Field
          id="email"
          label="Email"
          error={show("email")}
          hint="This is how we find your booking again."
        >
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={Boolean(show("email"))}
            placeholder="you@example.com"
          />
        </Field>

        <div className="bk__row">
          <Field id="phone" label="WhatsApp number" error={show("phone")}>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => blur("phone")}
              aria-invalid={Boolean(show("phone"))}
              placeholder="0300 1234567"
            />
          </Field>
          <Field id="seats" label="Seats" error={show("seats")}>
            <input
              id="seats"
              name="seats"
              type="number"
              min="1"
              max={Math.max(seatsLeft, 1)}
              value={form.seats}
              onChange={(e) => set("seats", parseInt(e.target.value, 10) || "")}
              onBlur={() => blur("seats")}
              aria-invalid={Boolean(show("seats"))}
            />
          </Field>
        </div>

        <div className="bk__row">
          <Field id="city" label="City" optional>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Islamabad"
            />
          </Field>
          <Field id="institution" label="University or college" optional>
            <input
              id="institution"
              name="institution"
              type="text"
              value={form.institution}
              onChange={(e) => set("institution", e.target.value)}
              placeholder="NUST"
            />
          </Field>
        </div>

        <Field
          id="pickup"
          label="Pickup point"
          optional
          hint="Faizabad, 26 Number, G-9 — or say where suits."
        >
          <input
            id="pickup"
            name="pickup"
            type="text"
            value={form.pickup}
            onChange={(e) => set("pickup", e.target.value)}
            placeholder="Faizabad"
          />
        </Field>
      </fieldset>

      <fieldset className="bk__set" disabled={sending}>
        <legend className="bk__legend">The advance</legend>
        <p className="bk__pay">
          Send the advance on WhatsApp, then fill this in. The receipt goes into
          the same chat — the next screen opens it for you.
          <strong>
            {" "}
            {form.seats > 0
              ? `${form.seats} × PKR ${money(trip.price)} = PKR ${money(amount)}`
              : `PKR ${money(trip.price)} per seat`}
          </strong>
        </p>

        {/* No upload here on purpose: a payment screenshot is something people
            already know how to send on WhatsApp, and it lands in the same thread
            as the booking rather than in a folder nobody opens. */}
        <ol className="bk__how">
          <li>
            <span>1</span> Send the advance to {site.phone} on WhatsApp.
          </li>
          <li>
            <span>2</span> Press the button below — WhatsApp opens with your
            booking written out.
          </li>
          <li>
            <span>3</span> Send your receipt screenshot in that same chat.
          </li>
        </ol>

        <Field id="notes" label="Anything we should know" optional>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Travelling with someone, dietary needs, paid the full amount…"
          />
        </Field>

        <label className={`bk__agree${show("agree") ? " is-bad" : ""}`}>
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => set("agree", e.target.checked)}
            onBlur={() => blur("agree")}
            aria-invalid={Boolean(show("agree"))}
          />
          <span>I have sent the advance on WhatsApp.</span>
        </label>
        {show("agree") && (
          <p className="bk__err" role="alert">
            <AlertCircle size={14} aria-hidden="true" /> {errors.agree}
          </p>
        )}
      </fieldset>

      <AnimatePresence>
        {failed && (
          <motion.p
            className="bk__fail"
            role="alert"
            initial={calm ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <AlertCircle size={16} aria-hidden="true" />
            <span>
              {failed} You can also{" "}
              <a className="link" href={site.wa} rel="noopener">
                message Wahid
              </a>
              .
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="bk__send">
        <button
          type="submit"
          className="btn btn--book bk__go"
          disabled={sending || Boolean(held)}
        >
          {sending ? (
            <>
              <Loader2 size={17} className="bk__spin" aria-hidden="true" />{" "}
              Opening WhatsApp…
            </>
          ) : (
            <>Send booking on WhatsApp</>
          )}
        </button>
        <p className="bk__small">
          This files your booking and opens WhatsApp with the details written
          out. Send the receipt in that chat. Nothing is charged here.
        </p>
      </div>
    </form>
  );
}

/* One field shape for the whole form: label, control, and an error that only
   takes up room once there is something to say. */
export function Field({ id, label, error, hint, optional, children }) {
  return (
    <p className={`bk__field${error ? " is-bad" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <i>optional</i>}
      </label>
      {children}
      {error ? (
        <span className="bk__err" role="alert">
          <AlertCircle size={14} aria-hidden="true" /> {error}
        </span>
      ) : (
        hint && <span className="bk__hint">{hint}</span>
      )}
    </p>
  );
}
