import { FC, useState, useEffect } from "react";
import type { OfferWithPublicKey } from "../idl/types";
import { useEscrow } from "../hooks";
import { OfferCard } from "./OfferCard";

interface MyOffersProps {
    refreshTrigger?: number;
}

export const MyOffers: FC<MyOffersProps> = ({ refreshTrigger }) => {
    const { getMyOffers, revokeOffer, walletAddress } = useEscrow();
    const [offers, setOffers] = useState<OfferWithPublicKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadOffers = async () => {
        setIsLoading(true);
        const myOffers = await getMyOffers();
        setOffers(myOffers);
        setIsLoading(false);
    };

    useEffect(() => {
        if (walletAddress) {
            loadOffers();
        }
    }, [refreshTrigger, walletAddress]);

    const handleRevoke = async (offer: OfferWithPublicKey) => {
        const confirmed = window.confirm(
            "are you sure you want to revoke this offer? tokens will be returned to your wallet."
        );

        if (confirmed) {
            const tx = await revokeOffer(offer);
            if (tx) {
                loadOffers();
            }
        }
    };

    if (!walletAddress) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="empty-state">
                <div className="loader" style={{ width: 40, height: 40 }} />
                <p style={{ marginTop: 16 }}>loading your offers...</p>
            </div>
        );
    }

    if (offers.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3 className="empty-state-title">No Active Offers</h3>
                <p className="empty-state-text">
                    you haven't created any offers yet. go to create offer to make your first one!
                </p>
            </div>
        );
    }

    return (
        <div className="offers-grid">
            {offers.map((offer) => (
                <OfferCard
                    key={offer.publicKey}
                    offer={offer}
                    isOwner={true}
                    onRevoke={handleRevoke}
                />
            ))}
        </div>
    );
};
