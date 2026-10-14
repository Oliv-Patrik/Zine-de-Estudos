import { StudySession, Subject } from '../types';

export function exportSessionsToCsv(
  sessions: StudySession[],
  subjects: Subject[],
  lang: 'pt-BR' | 'en' = 'pt-BR'
): void {
  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => subjectMap.set(s.id, s.name));

  const isPt = lang === 'pt-BR';
  const headers = isPt
    ? ['Data', 'Disciplina', 'Duração (min)', 'Duração Formatada', 'Tópico', 'Anotações', 'Via Pomodoro']
    : ['Date', 'Subject', 'Duration (min)', 'Formatted Duration', 'Topic', 'Notes', 'Via Pomodoro'];

  const rows = sessions.map((sess) => {
    const subjectName = subjectMap.get(sess.subjectId) || (isPt ? 'Disciplina excluída' : 'Deleted Subject');
    const hours = Math.floor(sess.durationMinutes / 60);
    const mins = sess.durationMinutes % 60;
    const formatted = `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    const fromPomo = sess.fromPomodoro ? (isPt ? 'Sim' : 'Yes') : (isPt ? 'Não' : 'No');

    // Escape quotes and fields containing commas/newlines
    const clean = (val: string | undefined | null) => {
      if (!val) return '""';
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    return [
      clean(sess.date),
      clean(subjectName),
      clean(String(sess.durationMinutes)),
      clean(formatted),
      clean(sess.topic || ''),
      clean(sess.notes || ''),
      clean(fromPomo),
    ].join(',');
  });

  // Include UTF-8 BOM (\uFEFF) for Excel compatibility with Portuguese accents
  const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `caderno_estudos_sessoes_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
