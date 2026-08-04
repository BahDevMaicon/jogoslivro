import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Heart, LogIn, Trash2 } from "lucide-react";
import type { LibraryBookEntry } from "@/stores/libraryStore";
import { useAuthStore } from "@/stores/authStore";
import {
  type DiscussionComment,
  deleteComment,
  fetchComments,
  fetchReportCounts,
  postComment,
  reportComment,
  toggleLike,
} from "@/engine/discussionEngine";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { TextareaField } from "@/components/editor/fields";

interface BookDiscussionTabProps {
  entry: LibraryBookEntry;
  canManage: boolean;
}

export function BookDiscussionTab({ entry, canManage }: BookDiscussionTabProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentUserId = currentUser?.id;
  const bookId = entry.supabaseBookId;

  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [reportCounts, setReportCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!bookId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [list, counts] = await Promise.all([
      fetchComments(bookId, currentUserId),
      canManage ? fetchReportCounts(bookId) : Promise.resolve(new Map<string, number>()),
    ]);
    setComments(list);
    setReportCounts(counts);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, currentUserId, canManage]);

  async function handlePost(parentId?: string) {
    if (!bookId || !currentUserId) return;
    const content = parentId ? replyText : newComment;
    setBusy(true);
    setError(null);
    const result = await postComment(bookId, currentUserId, content, parentId);
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? "Não foi possível publicar o comentário.");
      return;
    }
    if (parentId) {
      setReplyText("");
      setReplyingTo(null);
    } else {
      setNewComment("");
    }
    await refresh();
  }

  async function handleToggleLike(comment: DiscussionComment) {
    if (!currentUserId) return;
    await toggleLike(comment.id, currentUserId, comment.likedByMe);
    await refresh();
  }

  async function handleReport() {
    if (!currentUserId || !reportTarget) return;
    await reportComment(reportTarget, currentUserId);
    setReportTarget(null);
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteComment(deleteTarget);
    setDeleteTarget(null);
    await refresh();
  }

  if (!bookId) {
    return <p className="text-sm text-parchment-300/70">A discussão fica disponível assim que o livro é sincronizado com o servidor.</p>;
  }

  function renderComment(comment: DiscussionComment, isReply: boolean) {
    const reportCount = reportCounts.get(comment.id);
    return (
      <div key={comment.id} className="rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-display text-sm text-parchment-100">{comment.displayName || "Leitor"}</span>
          <span className="text-xs text-parchment-400/70">{new Date(comment.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-parchment-200/85">{comment.content}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
          <button
            type="button"
            className={`flex items-center gap-1 ${comment.likedByMe ? "text-ember-400" : "text-parchment-400 hover:text-ember-300"}`}
            disabled={!currentUserId}
            onClick={() => handleToggleLike(comment)}
          >
            <Heart className="h-3.5 w-3.5" fill={comment.likedByMe ? "currentColor" : "none"} aria-hidden="true" />
            {comment.likeCount}
          </button>
          {!isReply && currentUserId && (
            <button
              type="button"
              className="text-parchment-400 hover:text-ember-300"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              Responder
            </button>
          )}
          {currentUserId && (
            <button
              type="button"
              className="flex items-center gap-1 text-parchment-400 hover:text-ember-300 disabled:opacity-50"
              disabled={comment.reportedByMe}
              onClick={() => setReportTarget(comment.id)}
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" /> {comment.reportedByMe ? "Denunciado" : "Denunciar"}
            </button>
          )}
          {canManage && (
            <button
              type="button"
              className="ml-auto flex items-center gap-1 text-red-300 hover:text-red-200"
              onClick={() => setDeleteTarget(comment.id)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {reportCount ? `${reportCount} denúncia${reportCount > 1 ? "s" : ""}` : "Excluir"}
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="mt-3 flex flex-col gap-2">
            <TextareaField label="Sua resposta" value={replyText} onChange={setReplyText} rows={2} />
            <button type="button" className="btn-secondary self-start" disabled={busy} onClick={() => handlePost(comment.id)}>
              Enviar resposta
            </button>
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 border-l border-parchment-700/30 pl-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {currentUserId ? (
        <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-4">
          <TextareaField label="Comentar" value={newComment} onChange={setNewComment} rows={3} placeholder="O que você achou deste livro?" />
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          <button type="button" className="btn-secondary mt-3" disabled={busy || !newComment.trim()} onClick={() => handlePost()}>
            Comentar
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-parchment-300/70">
          <span>Quer participar da discussão?</span>
          <button type="button" className="btn-secondary" onClick={() => navigate(`/login?redirect=/book/${entry.book.id}`)}>
            <LogIn className="h-4 w-4" aria-hidden="true" /> Fazer login
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-parchment-400/70">Carregando...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-parchment-400/70">Nenhum comentário ainda — seja o primeiro a comentar.</p>
      ) : (
        <div className="flex flex-col gap-3">{comments.map((comment) => renderComment(comment, false))}</div>
      )}

      <ConfirmDialog
        open={reportTarget !== null}
        title="Denunciar comentário"
        message="Isso avisa o dono do livro (ou um administrador) para revisar este comentário. Continuar?"
        confirmLabel="Denunciar"
        onCancel={() => setReportTarget(null)}
        onConfirm={handleReport}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir comentário"
        message="Isso remove o comentário (e as respostas a ele) permanentemente. Continuar?"
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
