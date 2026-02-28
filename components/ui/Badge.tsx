import { styled, Text, XStack } from 'tamagui';
import type { OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';

const BadgeContainer = styled(XStack, {
  paddingHorizontal: '$md',
  paddingVertical: '$xs',
  borderRadius: '$full',
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    status: {
      pending: { backgroundColor: '$warningLight' },
      confirmed: { backgroundColor: '$infoLight' },
      scheduled: { backgroundColor: '$infoLight' },
      in_progress: { backgroundColor: '$primaryLight' },
      completed: { backgroundColor: '$successLight' },
      cancelled: { backgroundColor: '$errorLight' },
    },
  } as const,
});

const BadgeText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  fontFamily: '$body',

  variants: {
    status: {
      pending: { color: '$warning' },
      confirmed: { color: '$info' },
      scheduled: { color: '$info' },
      in_progress: { color: '$primary' },
      completed: { color: '$success' },
      cancelled: { color: '$error' },
    },
  } as const,
});

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <BadgeContainer status={status}>
      <BadgeText status={status}>{ORDER_STATUS_LABELS[status]}</BadgeText>
    </BadgeContainer>
  );
}

