import { useState } from 'react';
import { useParaNodes } from '@/hooks/useParaNodes';
import {
  createParaNode,
  updateParaNode,
  deleteParaNode,
  finishParaNode,
  reopenParaNode,
  archiveParaNode,
  restoreParaNode,
  setEstimatedMinutes,
  logTimeSpent,
} from '@/repositories/paraNode.repo';
import type { DepositType, PARANode } from '@/domain/types';
import { DEPOSIT_TYPE_LABELS } from '@/domain/paraRules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

const DEPOSIT_TYPES: DepositType[] = ['PROJECT', 'AREA', 'RESOURCE', 'ARCHIVE'];

const PAGE_SIZE = 5;

function daysSince(timestamp: number): number {
  return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ── Create form ──────────────────────────────────────────────────────────────

function CreateForm() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DepositType>('PROJECT');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createParaNode({ title: title.trim(), type, description: '' });
    setTitle('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 space-y-1">
        <label className="text-xs text-muted-foreground">Título</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del nuevo nodo"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Tipo</label>
        <select
          className="border rounded px-2 py-1 text-sm bg-background h-9"
          value={type}
          onChange={(e) => setType(e.target.value as DepositType)}
        >
          {DEPOSIT_TYPES.map((t) => (
            <option key={t} value={t}>
              {DEPOSIT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm">
        Agregar
      </Button>
    </form>
  );
}

// ── Inline edit row ──────────────────────────────────────────────────────────

function NodeRow({ node }: { node: PARANode }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description ?? '');
  const [estimated, setEstimated] = useState(String(node.estimatedMinutes ?? ''));

  const isFinished = node.status === 'FINISHED';
  const isArchived = node.type === 'ARCHIVE';

  async function handleSave() {
    const parsedEstimate = Number(estimated);
    await updateParaNode(node.id, {
      title: title.trim() || node.title,
      description,
    });
    if (!Number.isNaN(parsedEstimate) && estimated.trim() !== '') {
      await setEstimatedMinutes(node.id, parsedEstimate);
    }
    setEditing(false);
  }

  async function handleDelete() {
    const ok = window.confirm(`¿Eliminar "${node.title}" definitivamente? Esta acción no se puede deshacer.`);
    if (!ok) return;
    await deleteParaNode(node.id);
  }

  if (editing) {
    return (
      <li className="border rounded p-3 space-y-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="text-sm"
        />
        {node.type === 'PROJECT' && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Tiempo estimado (minutos)</label>
            <Input
              type="number"
              min={0}
              value={estimated}
              onChange={(e) => setEstimated(e.target.value)}
              placeholder="ej: 120"
              className="text-sm"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="border rounded p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isFinished ? 'line-through text-muted-foreground' : ''}`}>
            {node.title}
          </p>
          {node.description && (
            <p className="text-xs text-muted-foreground truncate">{node.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {isFinished && <Badge variant="secondary">Finalizado</Badge>}
            {isArchived && node.archivedFromType && (
              <Badge variant="outline">antes: {DEPOSIT_TYPE_LABELS[node.archivedFromType]}</Badge>
            )}
            <Badge variant="ghost">act. hace {daysSince(node.updatedAt)} día(s)</Badge>
            {node.type === 'PROJECT' && (node.estimatedMinutes || node.loggedMinutes) && (
              <Badge variant="ghost">
                ⏱ {formatMinutes(node.loggedMinutes ?? 0)}
                {node.estimatedMinutes ? ` / ${formatMinutes(node.estimatedMinutes)}` : ''}
              </Badge>
            )}
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Editar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {node.type === 'PROJECT' && (
          <Button size="sm" variant="outline" onClick={() => logTimeSpent(node.id, 15)}>
            +15 min
          </Button>
        )}
        {isFinished ? (
          <Button size="sm" variant="outline" onClick={() => reopenParaNode(node.id)}>
            Reabrir
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => finishParaNode(node.id)}>
            Finalizar
          </Button>
        )}
        {isArchived ? (
          <Button size="sm" variant="outline" onClick={() => restoreParaNode(node.id)}>
            Restaurar
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => archiveParaNode(node.id)}>
            Archivar
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          Eliminar
        </Button>
      </div>
    </li>
  );
}

// ── Paginated group list ─────────────────────────────────────────────────────

function GroupList({ nodes }: { nodes: PARANode[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = nodes.slice(0, visible);

  if (nodes.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Vacío.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {shown.map((node) => (
          <NodeRow key={node.id} node={node} />
        ))}
      </ul>
      {visible < nodes.length && (
        <Button size="sm" variant="ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
          Mostrar más ({nodes.length - visible} restantes)
        </Button>
      )}
    </div>
  );
}

// ── Browser grouped by type, one accordion section per depósito ─────────────

export function ParaBrowser() {
  const nodes = useParaNodes();

  const grouped = DEPOSIT_TYPES.reduce<Record<DepositType, PARANode[]>>(
    (acc, type) => {
      acc[type] = nodes.filter((n) => n.type === type);
      return acc;
    },
    { PROJECT: [], AREA: [], RESOURCE: [], ARCHIVE: [] },
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Explorador PARA</h1>

      <CreateForm />

      <Accordion>
        {DEPOSIT_TYPES.map((type, idx) => (
          <AccordionItem
            key={type}
            defaultOpen={idx === 0}
            title={DEPOSIT_TYPE_LABELS[type]}
            badge={<Badge variant="secondary">{grouped[type].length}</Badge>}
          >
            <GroupList nodes={grouped[type]} />
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
