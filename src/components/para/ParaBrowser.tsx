import { useState } from 'react';
import { useParaNodes } from '@/hooks/useParaNodes';
import { createParaNode, updateParaNode } from '@/repositories/paraNode.repo';
import type { DepositType, PARANode } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEPOSIT_TYPES: DepositType[] = ['PROJECT', 'AREA', 'RESOURCE', 'ARCHIVE'];

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
              {t}
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

  async function handleSave() {
    await updateParaNode(node.id, { title: title.trim() || node.title, description });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="border rounded p-3 space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="text-sm"
        />
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
    <li className="border rounded p-3 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{node.title}</p>
        {node.description && (
          <p className="text-xs text-muted-foreground truncate">{node.description}</p>
        )}
      </div>
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
        Editar
      </Button>
    </li>
  );
}

// ── Browser grouped by type ──────────────────────────────────────────────────

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

      {DEPOSIT_TYPES.map((type) => (
        <section key={type}>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            {type} ({grouped[type].length})
          </h2>
          {grouped[type].length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Vacío.</p>
          ) : (
            <ul className="space-y-2">
              {grouped[type].map((node) => (
                <NodeRow key={node.id} node={node} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
