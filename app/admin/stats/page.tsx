import { getGlobalStats, getWeakestCompetencies } from "@/lib/queries/admin-stats";

export default async function StatsAdminPage() {
  const [stats, weakestCompetencies] = await Promise.all([
    getGlobalStats(),
    getWeakestCompetencies(),
  ]);

  const cards = [
    { label: "Élèves inscrits", value: stats.totalStudents },
    { label: "Actifs (7 derniers jours)", value: stats.activeStudents7d },
    { label: "Quiz complétés", value: stats.totalQuizzesCompleted },
    { label: "Score moyen aux quiz", value: `${stats.averageQuizScore}%` },
    { label: "Leçons terminées (total)", value: stats.totalLessonsCompleted },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-foreground">Statistiques</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Compétences les plus faibles (moyenne tous élèves confondus)
        </h2>
        <p className="mb-3 max-w-2xl text-xs text-muted-foreground">
          Utile pour identifier où renforcer le contenu pédagogique (leçons ou exercices
          supplémentaires) — une compétence faible en moyenne peut indiquer un contenu
          mal expliqué, pas nécessairement des élèves en difficulté.
        </p>
        <div className="space-y-2">
          {weakestCompetencies.map((c) => (
            <div
              key={c.competencyName}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-sm"
            >
              <span className="text-foreground">
                {c.competencyName}
                {c.subjectName && <span className="text-muted-foreground"> — {c.subjectName}</span>}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{c.studentCount} élève(s)</span>
                <span
                  className={`font-mono font-medium ${
                    c.averageMastery < 50 ? "text-danger" : "text-warning-foreground"
                  }`}
                >
                  {c.averageMastery}%
                </span>
              </span>
            </div>
          ))}
          {weakestCompetencies.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Pas encore assez de données de progression pour afficher des statistiques.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
