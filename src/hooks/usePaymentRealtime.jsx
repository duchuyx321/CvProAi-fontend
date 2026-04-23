//quản lý SSE realtime cho trang thanh toán, kết nối, nhận dữ liệu mới nhất về trạng thái đơn hàng, ngắt kết nối khi không cần thiết...
import { useCallback, useRef, useState } from 'react';

import {
    buildRealtimeCandidates,
    connectEventSource,
    normalizeOrderForUi,
    parseRealtimePayload,
} from '~/pages/User/Payment/Payment.utils';

export default function usePaymentRealtime({ pkg }) {
    const realtimeSourceRef = useRef(null);
    const [realtimeState, setRealtimeState] = useState('idle');

    const stopRealtime = useCallback(() => {
        if (realtimeSourceRef.current) {
            realtimeSourceRef.current.close();
        }

        realtimeSourceRef.current = null;
        setRealtimeState('idle');
    }, []);

    const startRealtime = useCallback(
        async (createdOrder = {}, options = {}) => {
            const onMessage = typeof options?.onMessage === 'function' ? options.onMessage : null;
            const normalized = normalizeOrderForUi(createdOrder, pkg);
            const targetOrderId = normalized?.orderId;

            if (!targetOrderId) {
                return false;
            }

            stopRealtime();
            setRealtimeState('connecting');

            const candidates = buildRealtimeCandidates(normalized);

            for (const candidateUrl of candidates) {
                try {
                    const source = await connectEventSource(candidateUrl, {
                        onMessage: (data) => {
                            const parsed = parseRealtimePayload(data);
                            const nextOrder = normalizeOrderForUi(
                                {
                                    ...normalized,
                                    ...parsed.payload,
                                    status: parsed.status || parsed.payload?.status || normalized?.status,
                                },
                                pkg,
                            );
                            const latestOrderId = nextOrder?.orderId || targetOrderId;

                            onMessage?.(nextOrder, latestOrderId);
                        },
                    });

                    source.onerror = () => {
                        if (source.readyState === EventSource.CLOSED) {
                            setRealtimeState('disconnected');
                            return;
                        }

                        setRealtimeState('connecting');
                    };

                    source.onopen = () => {
                        setRealtimeState('connected');
                    };

                    realtimeSourceRef.current = source;
                    setRealtimeState('connected');
                    return true;
                } catch {
                    // thử endpoint tiếp theo
                }
            }

            setRealtimeState('disconnected');
            return false;
        },
        [pkg, stopRealtime],
    );

    return {
        realtimeState,
        startRealtime,
        stopRealtime,
    };
}
