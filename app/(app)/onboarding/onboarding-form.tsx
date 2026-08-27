"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { AlertCircle, User } from "lucide-react";

import { completeOnboardingAction } from "./actions";
import type { ActionState } from "@/app/admin/curriculum-actions";

import { Label, FieldError } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

interface Level {
  id: string;
  name: string;
  cycle_id: string;
}

interface Series {
  id: string;
  name: string;
  level_id: string;
}

interface LevelSubject {
  level_id: string;
  series_id: string | null;
  subject_id: string;
  subjects: {
    id: string;
    name: string;
  } | null;
}

export function OnboardingForm({
  levels,
  series,
  levelSubjects,
}: {
  levels: Level[];
  series: Series[];
  levelSubjects: LevelSubject[];
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(
    completeOnboardingAction,
    null
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");

  /*
   * Séries disponibles pour le niveau sélectionné.
   */
  const availableSeries = useMemo(
    () => series.filter((s) => s.level_id === selectedLevel),
    [series, selectedLevel]
  );

  /*
   * Matières disponibles pour le niveau + série.
   */
  const availableSubjects = useMemo(() => {
    return levelSubjects.filter(
      (ls) =>
        ls.level_id === selectedLevel &&
        (ls.series_id === null || ls.series_id === selectedSeries)
    );
  }, [levelSubjects, selectedLevel, selectedSeries]);

  return (
    <form action={formAction} className="space-y-6">
      {/* ERREUR GÉNÉRALE */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />

          <span>{state.error}</span>
        </div>
      )}

      {/* ========================= */}
      {/* INFORMATIONS PERSONNELLES */}
      {/* ========================= */}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <User
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              Parle-nous de toi
            </h2>

            <p className="text-sm text-muted-foreground">
              Ces informations permettront de personnaliser ton espace.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* PRÉNOM */}
          <div>
            <Label htmlFor="firstName">
              Prénom <span className="text-danger">*</span>
            </Label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Ex. Ben"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <FieldError
              id="firstName-error"
              message={state?.fieldErrors?.firstName}
            />
          </div>

          {/* NOM */}
          <div>
            <Label htmlFor="lastName">
              Nom
            </Label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Ex. Bop"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <FieldError
              id="lastName-error"
              message={state?.fieldErrors?.lastName}
            />
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* NIVEAU SCOLAIRE */}
      {/* ========================= */}

      <div>
        <Label htmlFor="levelId">
          Niveau scolaire
        </Label>

        <select
          id="levelId"
          name="levelId"
          required
          value={selectedLevel}
          onChange={(event) => {
            setSelectedLevel(event.target.value);
            setSelectedSeries("");
          }}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">
            Sélectionner ton niveau...
          </option>

          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>

        <FieldError
          id="levelId-error"
          message={state?.fieldErrors?.levelId}
        />
      </div>

      {/* ========================= */}
      {/* SÉRIE */}
      {/* ========================= */}

      {availableSeries.length > 0 && (
        <div>
          <Label htmlFor="seriesId">
            Série
          </Label>

          <select
            id="seriesId"
            name="seriesId"
            value={selectedSeries}
            onChange={(event) =>
              setSelectedSeries(event.target.value)
            }
            className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">
              Sélectionner ta série...
            </option>

            {availableSeries.map((serie) => (
              <option key={serie.id} value={serie.id}>
                {serie.name}
              </option>
            ))}
          </select>

          <FieldError
            id="seriesId-error"
            message={state?.fieldErrors?.seriesId}
          />
        </div>
      )}

      {/* ========================= */}
      {/* MATIÈRES */}
      {/* ========================= */}

      {selectedLevel && (
        <div>
          <Label>
            Matières
          </Label>

          {availableSubjects.length === 0 ? (
            <div className="mt-2 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Aucune matière n&apos;est encore associée à ce niveau.
                Un administrateur doit d&apos;abord les configurer.
              </p>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {availableSubjects.map((levelSubject) => {
                const subject = levelSubject.subjects;

                if (!subject) {
                  return null;
                }

                return (
                  <label
                    key={`${levelSubject.subject_id}-${levelSubject.series_id ?? "all"}`}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition hover:border-primary/40 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      name="subjectIds"
                      value={levelSubject.subject_id}
                      className="h-4 w-4 accent-primary"
                    />

                    <span className="font-medium">
                      {subject.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <FieldError
            id="subjectIds-error"
            message={state?.fieldErrors?.subjectIds}
          />
        </div>
      )}

      {/* ========================= */}
      {/* BOUTON */}
      {/* ========================= */}

      <SubmitButton>
        Continuer vers mon Dashboard
      </SubmitButton>
    </form>
  );
}