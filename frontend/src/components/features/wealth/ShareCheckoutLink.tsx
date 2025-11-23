import { Component, createSignal, Show } from 'solid-js';
import {
  useShareCheckoutLink,
  useCreateShareCheckoutLink,
  useRevokeShareCheckoutLink,
} from '@/hooks/queries/useCheckoutLinks';
import { checkoutLinksService } from '@/services/api/checkoutLinks.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { makeTranslator } from '@/i18n/makeTranslator';
import { shareCheckoutLinkDict } from './ShareCheckoutLink.i18n';
import { formatDistanceToNow } from 'date-fns';

interface ShareCheckoutLinkProps {
  shareId: string;
  shareName: string;
  shareUnitsRemaining: number;
  itemUnit: string;
}

export const ShareCheckoutLink: Component<ShareCheckoutLinkProps> = (props) => {
  const t = makeTranslator(shareCheckoutLinkDict, 'shareCheckoutLink');

  // Query hooks
  const checkoutLink = useShareCheckoutLink(() => props.shareId);

  // Mutation hooks
  const createLinkMutation = useCreateShareCheckoutLink();
  const revokeLinkMutation = useRevokeShareCheckoutLink();

  // Modal states
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [showRevokeModal, setShowRevokeModal] = createSignal(false);
  const [showInfoModal, setShowInfoModal] = createSignal(false);

  // Form state
  const [maxUnits, setMaxUnits] = createSignal('');

  // Handle copy checkout URL
  const handleCopyLink = async (checkoutUrl: string) => {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      // TODO: Show toast notification
      console.log(t('linkCopied'));
    } catch (error) {
      console.error('Failed to copy link:', error);
      console.log(t('linkCopyFailed'));
    }
  };

  // Handle download QR code
  const handleDownloadQR = () => {
    const link = checkoutLink.data;
    if (!link) return;

    const filename = `checkout-qr-${props.shareName.toLowerCase().replace(/\s+/g, '-')}.png`;
    checkoutLinksService.downloadQRCode(link.qrCodeDataUrl, filename);
    console.log(t('qrDownloaded'));
  };

  // Handle print QR code
  const handlePrintQR = () => {
    const link = checkoutLink.data;
    if (!link) return;

    checkoutLinksService.printQRCode(link.qrCodeDataUrl, props.shareName);
  };

  // Generate WhatsApp share URL
  const generateWhatsAppURL = () => {
    const link = checkoutLink.data;
    if (!link) return '';

    const itemName = props.shareName;
    const url = link.checkoutUrl;
    const maxUnits = link.maxUnitsPerCheckout
      ? `\n📦 Max per checkout: ${link.maxUnitsPerCheckout} ${props.itemUnit}`
      : '';

    const message = `${itemName}${maxUnits}\n\nScan the QR code or click this link to request:\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  // Handle WhatsApp share
  const handleShareWhatsApp = () => {
    const whatsappURL = generateWhatsAppURL();
    if (whatsappURL) {
      window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle create link
  const handleCreateLink = async () => {
    try {
      await createLinkMutation.mutateAsync({
        shareId: props.shareId,
        dto: {
          maxUnitsPerCheckout: maxUnits() ? parseFloat(maxUnits()) : null,
        },
      });

      // Reset form and close modal
      setMaxUnits('');
      setShowCreateModal(false);
      console.log(t('createSuccess'));
    } catch (error) {
      console.error('Failed to create checkout link:', error);
      console.log(t('createError'));
    }
  };

  // Handle revoke link
  const handleRevoke = async () => {
    try {
      await revokeLinkMutation.mutateAsync({
        shareId: props.shareId,
      });

      setShowRevokeModal(false);
      console.log(t('revokeSuccess'));
    } catch (error) {
      console.error('Failed to revoke checkout link:', error);
      console.log(t('revokeError'));
    }
  };

  return (
    <>
      <Card>
        <div class="space-y-4">
          {/* Header */}
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                {t('title')}
              </h3>
              <p class="text-sm text-stone-600 dark:text-stone-400">
                {t('subtitle')}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowInfoModal(true)}
            >
              <Icon name="info" size={14} />
            </Button>
          </div>

          {/* Loading State */}
          <Show when={!checkoutLink.isLoading}>
            {/* No Link - Show Generate Button */}
            <Show
              when={checkoutLink.data}
              fallback={
                <div class="text-center py-8">
                  <Icon name="qr-code" size={48} class="mx-auto mb-4 text-stone-400" />
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Icon name="plus" size={16} />
                    {t('generateButton')}
                  </Button>
                </div>
              }
            >
              {/* Link Exists - Show Details */}
              {(link) => (
                <div class="space-y-4">
                  {/* Status Badge */}
                  <div class="flex items-center gap-2">
                    <Badge variant={link().isActive ? 'success' : 'default'}>
                      {link().isActive ? t('active') : t('inactive')}
                    </Badge>
                    <Show when={!link().isActive && link().deactivationReason}>
                      <span class="text-sm text-stone-600 dark:text-stone-400">
                        {t(`deactivatedReason.${link().deactivationReason!}`) || link().deactivationReason}
                      </span>
                    </Show>
                  </div>

                  {/* QR Code and Info Grid */}
                  <div class="grid md:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div class="flex flex-col items-center justify-center p-6 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <p class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                        {t('qrCodeTitle')}
                      </p>
                      <img
                        src={link().qrCodeDataUrl}
                        alt="QR Code"
                        class="w-48 h-48 rounded-lg border-2 border-stone-200 dark:border-stone-700"
                        onError={(e) => {
                          console.error('Failed to load QR code image for share:', {
                            shareId: link().shareId,
                            qrCodeDataUrl: link().qrCodeDataUrl?.substring(0, 50) + '...',
                            error: e
                          });
                        }}
                        onLoad={() => {
                          console.log('QR code loaded successfully for share:', link().shareId);
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div class="space-y-3">
                      <div>
                        <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                          {t('checkoutUrl')}
                        </p>
                        <div class="flex items-center gap-2">
                          <code class="flex-1 text-xs text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 p-2 rounded overflow-x-auto">
                            {link().checkoutUrl}
                          </code>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopyLink(link().checkoutUrl)}
                          >
                            <Icon name="clipboard" size={14} />
                          </Button>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                            {t('maxPerCheckout')}
                          </p>
                          <p class="text-sm text-stone-900 dark:text-stone-100">
                            {link().maxUnitsPerCheckout
                              ? `${link().maxUnitsPerCheckout} ${props.itemUnit}`
                              : t('unlimited')}
                          </p>
                        </div>

                        <div>
                          <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                            {t('remainingUnits')}
                          </p>
                          <p class="text-sm text-stone-900 dark:text-stone-100">
                            {link().shareUnitsRemaining} {props.itemUnit}
                          </p>
                        </div>

                        <div>
                          <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                            {t('totalCheckouts')}
                          </p>
                          <p class="text-sm text-stone-900 dark:text-stone-100">
                            {link().totalCheckouts}
                          </p>
                        </div>

                        <div>
                          <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                            {t('unitsDistributed')}
                          </p>
                          <p class="text-sm text-stone-900 dark:text-stone-100">
                            {link().totalUnitsDistributed} {props.itemUnit}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                          {t('lastUsed')}
                        </p>
                        <p class="text-sm text-stone-900 dark:text-stone-100">
                          {link().lastCheckoutAt
                            ? formatDistanceToNow(new Date(link().lastCheckoutAt!), { addSuffix: true })
                            : t('neverUsed')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Show when={link().isActive}>
                    <div class="flex flex-wrap gap-2 pt-4 border-t border-stone-200 dark:border-stone-700">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDownloadQR}
                      >
                        <Icon name="download" size={14} />
                        {t('downloadQR')}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePrintQR}
                      >
                        <Icon name="printer" size={14} />
                        {t('printQR')}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleShareWhatsApp}
                        style={{ "background-color": "#25D366", color: "white" }}
                        class="hover:opacity-90"
                        title={t('shareWhatsApp')}
                        aria-label={t('shareWhatsApp')}
                      >
                        <Icon name="whatsapp" size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowRevokeModal(true)}
                      >
                        <Icon name="x-circle" size={14} />
                        {t('revokeLink')}
                      </Button>
                    </div>
                  </Show>
                </div>
              )}
            </Show>
          </Show>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal()}
        onClose={() => setShowCreateModal(false)}
        title={t('createModalTitle')}
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              {t('maxUnitsPerCheckout')}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              max={props.shareUnitsRemaining}
              value={maxUnits()}
              onInput={(e) => setMaxUnits(e.currentTarget.value)}
              placeholder={t('maxUnitsPerCheckoutPlaceholder')}
            />
            <p class="text-xs text-stone-600 dark:text-stone-400 mt-1">
              {t('maxUnitsPerCheckoutHelp')}
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreateLink}
              disabled={createLinkMutation.isPending}
            >
              {createLinkMutation.isPending ? t('generating') : t('generate')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Modal */}
      <Modal
        isOpen={showRevokeModal()}
        onClose={() => setShowRevokeModal(false)}
        title={t('revokeModalTitle')}
      >
        <div class="space-y-4">
          <p class="text-stone-700 dark:text-stone-300">
            {t('revokeConfirm')}
          </p>
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {t('revokeWarning')}
          </p>

          <div class="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowRevokeModal(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleRevoke}
              disabled={revokeLinkMutation.isPending}
            >
              {revokeLinkMutation.isPending ? 'Revoking...' : t('confirmRevoke')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Info Modal */}
      <Modal
        isOpen={showInfoModal()}
        onClose={() => setShowInfoModal(false)}
        title={t('infoTitle')}
      >
        <div class="space-y-4">
          <ol class="space-y-3">
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <p class="text-sm text-stone-700 dark:text-stone-300">
                {t('infoStep1')}
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <p class="text-sm text-stone-700 dark:text-stone-300">
                {t('infoStep2')}
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <p class="text-sm text-stone-700 dark:text-stone-300">
                {t('infoStep3')}
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 flex items-center justify-center text-sm font-semibold">
                4
              </span>
              <p class="text-sm text-stone-700 dark:text-stone-300">
                {t('infoStep4')}
              </p>
            </li>
          </ol>

          <div class="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <p class="text-sm text-stone-600 dark:text-stone-400">
              {t('infoNote')}
            </p>
          </div>

          <div class="flex justify-end pt-4">
            <Button onClick={() => setShowInfoModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
