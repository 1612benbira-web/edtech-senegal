// Types générés manuellement depuis le schéma SQL (supabase/migrations/).
//
// Idéalement, ce fichier serait généré automatiquement via :
//   npx supabase gen types typescript --project-id <PROJECT_ID> > lib/types/database.ts
// (voir README.md). Cette version manuelle sert de solution immédiate —
// elle couvre les colonnes réellement utilisées par le code de
// l'application, pas nécessairement 100% des colonnes de chaque table.
// Si le schéma évolue significativement, régénérer via le CLI est
// recommandé plutôt que de maintenir ce fichier à la main indéfiniment.

type ContentStatus = "draft" | "review" | "validated" | "published" | "archived";
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          phone: string | null;
          level_id: string | null;
          series_id: string | null;
          daily_goal: number;
          timezone: string;
          role: "student" | "admin" | "teacher" | "school_admin";
          xp_total: number;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [{ foreignKeyName: "profiles_level_id_fkey"; columns: ["level_id"]; isOneToOne: false; referencedRelation: "school_levels"; referencedColumns: ["id"] }, { foreignKeyName: "profiles_series_id_fkey"; columns: ["series_id"]; isOneToOne: false; referencedRelation: "school_series"; referencedColumns: ["id"] }];
      };
      profile_subjects: {
        Row: { profile_id: string; subject_id: string; [key: string]: unknown };
        Insert: Partial<Database["public"]["Tables"]["profile_subjects"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profile_subjects"]["Row"]>;
        Relationships: [{ foreignKeyName: "profile_subjects_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "profile_subjects_subject_id_fkey"; columns: ["subject_id"]; isOneToOne: false; referencedRelation: "subjects"; referencedColumns: ["id"] }];
      };
      school_cycles: {
        Row: { id: string; code: string; name: string; order: number; created_at: string; [key: string]: unknown };
        Insert: Partial<Database["public"]["Tables"]["school_cycles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["school_cycles"]["Row"]>;
        Relationships: [];
      };
      school_levels: {
        Row: {
          id: string;
          cycle_id: string;
          code: string;
          name: string;
          order: number;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["school_levels"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["school_levels"]["Row"]>;
        Relationships: [{ foreignKeyName: "school_levels_cycle_id_fkey"; columns: ["cycle_id"]; isOneToOne: false; referencedRelation: "school_cycles"; referencedColumns: ["id"] }];
      };
      school_series: {
        Row: { id: string; level_id: string; code: string; name: string; created_at: string; [key: string]: unknown };
        Insert: Partial<Database["public"]["Tables"]["school_series"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["school_series"]["Row"]>;
        Relationships: [{ foreignKeyName: "school_series_level_id_fkey"; columns: ["level_id"]; isOneToOne: false; referencedRelation: "school_levels"; referencedColumns: ["id"] }];
      };
      subjects: {
        Row: { id: string; code: string; name: string; icon: string | null; created_at: string; [key: string]: unknown };
        Insert: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
        Relationships: [];
      };
      level_subjects: {
        Row: {
          id: string;
          level_id: string;
          series_id: string | null;
          subject_id: string;
          is_optional: boolean;
          weekly_hours: number | null;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["level_subjects"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["level_subjects"]["Row"]>;
        Relationships: [{ foreignKeyName: "level_subjects_level_id_fkey"; columns: ["level_id"]; isOneToOne: false; referencedRelation: "school_levels"; referencedColumns: ["id"] }, { foreignKeyName: "level_subjects_series_id_fkey"; columns: ["series_id"]; isOneToOne: false; referencedRelation: "school_series"; referencedColumns: ["id"] }, { foreignKeyName: "level_subjects_subject_id_fkey"; columns: ["subject_id"]; isOneToOne: false; referencedRelation: "subjects"; referencedColumns: ["id"] }];
      };
      // ============================================================
      // MULTI-ÉCOLES (0017/0018)
      // ============================================================
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          code: string;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["schools"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["schools"]["Row"]>;
        Relationships: [];
      };
      school_members: {
        Row: {
          id: string;
          school_id: string;
          profile_id: string;
          role: "student" | "teacher" | "school_admin";
          status: "active" | "inactive";
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["school_members"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["school_members"]["Row"]>;
        Relationships: [{ foreignKeyName: "school_members_school_id_fkey"; columns: ["school_id"]; isOneToOne: false; referencedRelation: "schools"; referencedColumns: ["id"] }, { foreignKeyName: "school_members_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      school_curriculums: {
        Row: {
          id: string;
          school_id: string;
          curriculum_id: string;
          enabled: boolean;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["school_curriculums"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["school_curriculums"]["Row"]>;
        Relationships: [{ foreignKeyName: "school_curriculums_school_id_fkey"; columns: ["school_id"]; isOneToOne: false; referencedRelation: "schools"; referencedColumns: ["id"] }, { foreignKeyName: "school_curriculums_curriculum_id_fkey"; columns: ["curriculum_id"]; isOneToOne: false; referencedRelation: "curriculums"; referencedColumns: ["id"] }];
      };
      curriculums: {
        Row: {
          id: string;
          level_id: string;
          series_id: string | null;
          subject_id: string;
          title: string;
          description: string | null;
          version: string;
          status: ContentStatus;
          source: string | null;
          source_url: string | null;
          source_document: string | null;
          is_demo: boolean;
          internal_notes: string | null;
          published_at: string | null;
          validated: boolean;
          validated_by: string | null;
          validated_at: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["curriculums"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["curriculums"]["Row"]>;
        Relationships: [{ foreignKeyName: "curriculums_level_id_fkey"; columns: ["level_id"]; isOneToOne: false; referencedRelation: "school_levels"; referencedColumns: ["id"] }, { foreignKeyName: "curriculums_series_id_fkey"; columns: ["series_id"]; isOneToOne: false; referencedRelation: "school_series"; referencedColumns: ["id"] }, { foreignKeyName: "curriculums_subject_id_fkey"; columns: ["subject_id"]; isOneToOne: false; referencedRelation: "subjects"; referencedColumns: ["id"] }, { foreignKeyName: "curriculums_validated_by_fkey"; columns: ["validated_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      domains: {
        Row: { id: string; curriculum_id: string; name: string; order: number; created_at: string; [key: string]: unknown };
        Insert: Partial<Database["public"]["Tables"]["domains"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["domains"]["Row"]>;
        Relationships: [{ foreignKeyName: "domains_curriculum_id_fkey"; columns: ["curriculum_id"]; isOneToOne: false; referencedRelation: "curriculums"; referencedColumns: ["id"] }];
      };
      competencies: {
        Row: {
          id: string;
          domain_id: string;
          name: string;
          description: string | null;
          order: number;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["competencies"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["competencies"]["Row"]>;
        Relationships: [{ foreignKeyName: "competencies_domain_id_fkey"; columns: ["domain_id"]; isOneToOne: false; referencedRelation: "domains"; referencedColumns: ["id"] }];
      };
      chapters: {
        Row: {
          id: string;
          curriculum_id: string;
          domain_id: string | null;
          title: string;
          order: number;
          status: ContentStatus;
          source: string | null;
          source_url: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["chapters"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["chapters"]["Row"]>;
        Relationships: [{ foreignKeyName: "chapters_curriculum_id_fkey"; columns: ["curriculum_id"]; isOneToOne: false; referencedRelation: "curriculums"; referencedColumns: ["id"] }, { foreignKeyName: "chapters_domain_id_fkey"; columns: ["domain_id"]; isOneToOne: false; referencedRelation: "domains"; referencedColumns: ["id"] }];
      };
      lessons: {
        Row: {
          id: string;
          chapter_id: string;
          competency_id: string | null;
          title: string;
          content_md: string;
          objectives: string[] | null;
          summary: string | null;
          order: number;
          status: ContentStatus;
          source: string | null;
          source_url: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
        Relationships: [{ foreignKeyName: "lessons_chapter_id_fkey"; columns: ["chapter_id"]; isOneToOne: false; referencedRelation: "chapters"; referencedColumns: ["id"] }, { foreignKeyName: "lessons_competency_id_fkey"; columns: ["competency_id"]; isOneToOne: false; referencedRelation: "competencies"; referencedColumns: ["id"] }];
      };
      exercises: {
        Row: {
          id: string;
          lesson_id: string;
          competency_id: string | null;
          title: string;
          instructions: string | null;
          difficulty: "easy" | "medium" | "hard" | "expert";
          difficulty_score: number;
          status: ContentStatus;
          deleted_at: string | null;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["exercises"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["exercises"]["Row"]>;
        Relationships: [{ foreignKeyName: "exercises_lesson_id_fkey"; columns: ["lesson_id"]; isOneToOne: false; referencedRelation: "lessons"; referencedColumns: ["id"] }, { foreignKeyName: "exercises_competency_id_fkey"; columns: ["competency_id"]; isOneToOne: false; referencedRelation: "competencies"; referencedColumns: ["id"] }];
      };
      questions: {
        Row: {
          id: string;
          exercise_id: string;
          competency_id: string | null;
          chapter_id: string | null;
          type:
            | "single_choice"
            | "multiple_choice"
            | "true_false"
            | "numeric"
            | "short_answer"
            | "matching"
            | "ordering";
          prompt: string;
          explanation: string | null;
          points: number;
          difficulty_score: number;
          status: ContentStatus;
          deleted_at: string | null;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
        Relationships: [{ foreignKeyName: "questions_exercise_id_fkey"; columns: ["exercise_id"]; isOneToOne: false; referencedRelation: "exercises"; referencedColumns: ["id"] }, { foreignKeyName: "questions_competency_id_fkey"; columns: ["competency_id"]; isOneToOne: false; referencedRelation: "competencies"; referencedColumns: ["id"] }, { foreignKeyName: "questions_chapter_id_fkey"; columns: ["chapter_id"]; isOneToOne: false; referencedRelation: "chapters"; referencedColumns: ["id"] }];
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          label: string;
          is_correct: boolean;
          match_key: string | null;
          order: number | null;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["question_options"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["question_options"]["Row"]>;
        Relationships: [{ foreignKeyName: "question_options_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "questions"; referencedColumns: ["id"] }];
      };
      lesson_progress: {
        Row: {
          id: string;
          profile_id: string;
          lesson_id: string;
          status: "not_started" | "in_progress" | "completed";
          started_at: string | null;
          completed_at: string | null;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]>;
        Relationships: [{ foreignKeyName: "lesson_progress_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "lesson_progress_lesson_id_fkey"; columns: ["lesson_id"]; isOneToOne: false; referencedRelation: "lessons"; referencedColumns: ["id"] }];
      };
      competency_progress: {
        Row: {
          id: string;
          profile_id: string;
          competency_id: string;
          mastery_score: number;
          attempts_count: number;
          correct_count: number;
          last_reviewed_at: string | null;
          next_review_at: string | null;
          updated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["competency_progress"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["competency_progress"]["Row"]>;
        Relationships: [{ foreignKeyName: "competency_progress_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "competency_progress_competency_id_fkey"; columns: ["competency_id"]; isOneToOne: false; referencedRelation: "competencies"; referencedColumns: ["id"] }];
      };
      exercise_attempts: {
        Row: {
          id: string;
          profile_id: string;
          question_id: string;
          is_correct: boolean;
          answer_payload: Json;
          time_spent_seconds: number | null;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["exercise_attempts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["exercise_attempts"]["Row"]>;
        Relationships: [{ foreignKeyName: "exercise_attempts_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "exercise_attempts_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "questions"; referencedColumns: ["id"] }];
      };
      quiz_attempts: {
        Row: {
          id: string;
          profile_id: string;
          type: "chapter" | "subject" | "review" | "evaluation" | "daily";
          subject_id: string | null;
          chapter_id: string | null;
          score: number | null;
          total_questions: number | null;
          correct_answers: number | null;
          started_at: string;
          completed_at: string | null;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["quiz_attempts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Row"]>;
        Relationships: [{ foreignKeyName: "quiz_attempts_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "quiz_attempts_subject_id_fkey"; columns: ["subject_id"]; isOneToOne: false; referencedRelation: "subjects"; referencedColumns: ["id"] }, { foreignKeyName: "quiz_attempts_chapter_id_fkey"; columns: ["chapter_id"]; isOneToOne: false; referencedRelation: "chapters"; referencedColumns: ["id"] }];
      };
      quiz_questions: {
        Row: {
          quiz_attempt_id: string;
          question_id: string;
          order: number | null;
          is_correct: boolean | null;
          answer_payload: Json;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["quiz_questions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["quiz_questions"]["Row"]>;
        Relationships: [{ foreignKeyName: "quiz_questions_quiz_attempt_id_fkey"; columns: ["quiz_attempt_id"]; isOneToOne: false; referencedRelation: "quiz_attempts"; referencedColumns: ["id"] }, { foreignKeyName: "quiz_questions_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "questions"; referencedColumns: ["id"] }];
      };
      daily_quiz_config: {
        Row: {
          id: number;
          questions_count: number;
          ratio_recent: number;
          ratio_review: number;
          ratio_challenge: number;
          exclude_recent_days: number;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_quiz_config"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["daily_quiz_config"]["Row"]>;
        Relationships: [];
      };
      daily_quizzes: {
        Row: {
          id: string;
          profile_id: string;
          quiz_attempt_id: string | null;
          date: string;
          generated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_quizzes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["daily_quizzes"]["Row"]>;
        Relationships: [{ foreignKeyName: "daily_quizzes_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "daily_quizzes_quiz_attempt_id_fkey"; columns: ["quiz_attempt_id"]; isOneToOne: false; referencedRelation: "quiz_attempts"; referencedColumns: ["id"] }];
      };
      daily_quiz_questions: {
        Row: {
          daily_quiz_id: string;
          question_id: string;
          reason:
            | "recent_lesson"
            | "weak_mastery"
            | "past_incorrect"
            | "due_review"
            | "harder_challenge"
            | "new_notion"
            | null;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_quiz_questions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["daily_quiz_questions"]["Row"]>;
        Relationships: [{ foreignKeyName: "daily_quiz_questions_daily_quiz_id_fkey"; columns: ["daily_quiz_id"]; isOneToOne: false; referencedRelation: "daily_quizzes"; referencedColumns: ["id"] }, { foreignKeyName: "daily_quiz_questions_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "questions"; referencedColumns: ["id"] }];
      };
      xp_transactions: {
        Row: {
          id: string;
          profile_id: string;
          amount: number;
          reason: string;
          reference_id: string | null;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["xp_transactions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["xp_transactions"]["Row"]>;
        Relationships: [{ foreignKeyName: "xp_transactions_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      streaks: {
        Row: {
          profile_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          updated_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["streaks"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["streaks"]["Row"]>;
        Relationships: [{ foreignKeyName: "streaks_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      badges: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          icon: string | null;
          criteria: Json;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["badges"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["badges"]["Row"]>;
        Relationships: [];
      };
      user_badges: {
        Row: { profile_id: string; badge_id: string; earned_at: string; [key: string]: unknown };
        Insert: Partial<Database["public"]["Tables"]["user_badges"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["user_badges"]["Row"]>;
        Relationships: [{ foreignKeyName: "user_badges_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "user_badges_badge_id_fkey"; columns: ["badge_id"]; isOneToOne: false; referencedRelation: "badges"; referencedColumns: ["id"] }];
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          type: string;
          title: string;
          body: string | null;
          read_at: string | null;
          created_at: string;
          [key: string]: unknown;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [{ foreignKeyName: "notifications_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_force_logout_user: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      get_level_leaderboard: {
        Args: { p_level_id: string; p_limit?: number };
        Returns: { profile_id: string; first_name: string; last_name_initial: string | null; xp_total: number; rank: number }[];
      };
      get_my_level_rank: {
        Args: { p_level_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
