import { useEffect, useState } from 'react'
import { ROLES, useMutations, useQuery, useUser, type Role } from 'deepspace'
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react'

import {
  Button,
  ConfirmModal,
  EmptyState,
  Input,
  Label,
  Modal,
  Textarea,
  useToast,
} from '@/components/ui'

interface Client {
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  ownerId: string
}

type ClientRecord = {
  recordId: string
  data: Client
  createdAt: string
}

interface ClientFormData {
  name: string
  company: string
  email: string
  phone: string
  address: string
}

const EMPTY_FORM: ClientFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
}

interface ClientModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ClientFormData) => Promise<boolean>
  initialData?: ClientFormData
  mode?: 'create' | 'edit'
}

function ClientModal({
  open,
  onClose,
  onSubmit,
  initialData = EMPTY_FORM,
  mode = 'create',
}: ClientModalProps) {
  const [form, setForm] = useState<ClientFormData>(initialData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData)
    }
  }, [open, initialData])

  const updateField = (
    field: keyof ClientFormData,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || saving) {
      return
    }

    setSaving(true)

    try {
      const success = await onSubmit({
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      })

      if (!success) {
        return
      }

      if (mode === 'create') {
        setForm(EMPTY_FORM)
      }

      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (saving) {
      return
    }

    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
    >
      <Modal.Header>
        <Modal.Title>
          {mode === 'edit' ? 'Edit Client' : 'Add Client'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="client-name"
              className="mb-2 block"
            >
              Client name
            </Label>

            <Input
              id="client-name"
              value={form.name}
              onChange={(event) =>
                updateField('name', event.target.value)
              }
              placeholder="Acme Corporation"
              autoFocus
            />
          </div>

          <div>
            <Label
              htmlFor="client-company"
              className="mb-2 block"
            >
              Company
            </Label>

            <Input
              id="client-company"
              value={form.company}
              onChange={(event) =>
                updateField('company', event.target.value)
              }
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <Label
              htmlFor="client-email"
              className="mb-2 block"
            >
              Email
            </Label>

            <Input
              id="client-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField('email', event.target.value)
              }
              placeholder="billing@acme.com"
            />
          </div>

          <div>
            <Label
              htmlFor="client-phone"
              className="mb-2 block"
            >
              Phone
            </Label>

            <Input
              id="client-phone"
              value={form.phone}
              onChange={(event) =>
                updateField('phone', event.target.value)
              }
              placeholder="+1 555 123 4567"
            />
          </div>

          <div>
            <Label
              htmlFor="client-address"
              className="mb-2 block"
            >
              Address
            </Label>

            <Textarea
              id="client-address"
              value={form.address}
              onChange={(event) =>
                updateField('address', event.target.value)
              }
              placeholder="Client billing address"
              rows={3}
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          onClick={() => void handleSubmit()}
          disabled={!form.name.trim()}
          loading={saving}
        >
          {mode === 'edit' ? 'Save Changes' : 'Add Client'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default function ClientsPage() {
  const { user } = useUser()
  const role = (user?.role ?? ROLES.VIEWER) as Role
  const canCreate = role === ROLES.MEMBER || role === ROLES.ADMIN

  const toast = useToast()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] =
  useState<ClientRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClientRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { records: clients, status } = useQuery<Client>('clients', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })

  const {
    createConfirmed,
    putConfirmed,
    removeConfirmed,
  } = useMutations<Client>('clients')

  const handleCreate = async (data: ClientFormData): Promise<boolean> => {
    if (!user) {
      toast.error('Could not add client', 'Please sign in and try again.')
      return false
    }

    try {
      await createConfirmed({
        ...data,
        ownerId: user.id,
      })

      toast.success('Client added', `${data.name} was added successfully.`)
      return true
    } catch (error) {
      toast.error(
        'Could not add client',
        error instanceof Error ? error.message : 'Please try again.',
      )

      return false
    }
  }

  const handleEdit = async (
    data: ClientFormData,
  ): Promise<boolean> => {
    if (!editTarget) {
      return false
    }

    try {
      await putConfirmed(editTarget.recordId, {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
      })

      toast.success(
        'Client updated',
        `${data.name} was updated successfully.`,
      )

      setEditTarget(null)
      return true
    } catch (error) {
      toast.error(
        'Could not update client',
        error instanceof Error
          ? error.message
          : 'Please try again.',
      )

      return false
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return

    setDeleting(true)

    try {
      await removeConfirmed(deleteTarget.recordId)

      toast.success(
        'Client deleted',
        `${deleteTarget.data.name} was removed.`,
      )

      setDeleteTarget(null)
    } catch (error) {
      toast.error(
        'Could not delete client',
        error instanceof Error ? error.message : 'Please try again.',
      )
    } finally {
      setDeleting(false)
    }
  }

  const isLoading = status === 'loading'

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Clients
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage the customers you bill through BillSpace.
              </p>
            </div>

            {canCreate && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus aria-hidden="true" />
                Add Client
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading clients"
            aria-busy="true"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-xl border border-border bg-muted/40"
              />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Add your first client to start creating invoices."
            icon={<Building2 aria-hidden="true" />}
            action={
              canCreate
                ? {
                    label: 'Add client',
                    onClick: () => setShowCreateModal(true),
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => {
              const isOwner =
                client.data.ownerId === user?.id || role === ROLES.ADMIN

              return (
                <article
                  key={client.recordId}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-foreground">
                        {client.data.name}
                      </h2>

                      {client.data.company && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {client.data.company}
                        </p>
                      )}
                    </div>

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(client)}
                        aria-label={`Delete ${client.data.name}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {client.data.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-4" aria-hidden="true" />
                        <span className="truncate">
                          {client.data.email}
                        </span>
                      </div>
                    )}

                    {client.data.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4" aria-hidden="true" />
                        <span>{client.data.phone}</span>
                      </div>
                    )}

                    {client.data.address && (
                      <div className="flex items-start gap-2">
                        <MapPin
                          className="mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{client.data.address}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-5 text-xs text-muted-foreground">
                    Added {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <ClientModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      <ClientModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        mode="edit"
        initialData={
          editTarget
            ? {
                name: editTarget.data.name,
                company: editTarget.data.company ?? '',
                email: editTarget.data.email ?? '',
                phone: editTarget.data.phone ?? '',
                address: editTarget.data.address ?? '',
              }
            : EMPTY_FORM
        }
      />
    </div>
  )
}

