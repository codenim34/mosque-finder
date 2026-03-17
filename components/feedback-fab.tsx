'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function FeedbackFab() {
  const pathname = usePathname()
  const { translate } = useLanguage()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: 'feedback' as 'feedback' | 'suggestion' | 'problem',
    anonymous: true,
    name: '',
    contact: '',
    message: '',
  })

  const handleSubmit = async () => {
    if (!form.message.trim()) {
      toast.info(translate('feedbackMessage'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          pagePath: pathname,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      toast.success(translate('feedbackSubmitted'))
      setForm((prev) => ({
        ...prev,
        message: '',
      }))
      setOpen(false)
    } catch (error) {
      console.error('Feedback submit error:', error)
      toast.error(translate('pleaseTryAgainLater'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full shadow-lg"
          aria-label={translate('feedbackTitle')}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{translate('feedbackTitle')}</DialogTitle>
          <DialogDescription>{translate('feedbackDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{translate('feedbackType')}</Label>
            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  type: value as 'feedback' | 'suggestion' | 'problem',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feedback">{translate('feedbackTypeFeedback')}</SelectItem>
                <SelectItem value="suggestion">{translate('feedbackTypeSuggestion')}</SelectItem>
                <SelectItem value="problem">{translate('feedbackTypeProblem')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.anonymous}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  anonymous: checked === true,
                }))
              }
            />
            <span>{translate('anonymous')}</span>
          </label>

          {!form.anonymous && (
            <div className="grid grid-cols-1 gap-2">
              <Input
                placeholder={translate('yourName')}
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
              <Input
                placeholder={translate('contactInfoLabel')}
                value={form.contact}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    contact: event.target.value,
                  }))
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{translate('feedbackMessage')}</Label>
            <Textarea
              placeholder={translate('feedbackMessagePlaceholder')}
              value={form.message}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  message: event.target.value,
                }))
              }
              rows={4}
            />
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {translate('submittingFeedback')}
              </>
            ) : (
              translate('submitFeedback')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
