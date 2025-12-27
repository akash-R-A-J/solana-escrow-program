import { FC, useState, useEffect } from "react";
import type { OfferWithPublicKey } from "../idl/types";
import { useEscrow } from "../hooks";
import { OfferCard } from "./OfferCard";
import { TakeOfferModal } from "./TakeOfferModal";

interface OffersListProps {
    refreshTrigger?: number;
}

export const OffersList: FC<OffersListProps> = ({ refreshTrigger }) => {
    const { getAllOffers, takeOffer, loading, walletAddress } = useEscrow();
    const [offers, setOffers] = useState<OfferWithPublicKey[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<OfferWithPublicKey | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadOffers = async () => {
        setIsLoading(true);
        const allOffers = await getAllOffers();
        const otherOffers = allOffers.filter(
            (offer) => offer.offerMaker !== walletAddress
        );
        setOffers(otherOffers);
        setIsLoading(false);
    };

    useEffect(() => {
        loadOffers();
    }, [refreshTrigger, walletAddress]);

    const handleTakeOffer = async (offer: OfferWithPublicKey) => {
        setSelectedOffer(offer);
    };

    const confirmTakeOffer = async () => {
        if (!selectedOffer) return;

        const tx = await takeOffer(selectedOffer);
        if (tx) {
            setSelectedOffer(null);
            loadOffers();
        }
    };

    if (isLoading) {
        return (
            <div className="empty-state">
                <div className="loader" style={{ width: 40, height: 40 }} />
                <p style={{ marginTop: 16 }}>loading offers...</p>
            </div>
        );
    }

    if (offers.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3 className="empty-state-title">No Offers Available</h3>
                <p className="empty-state-text">
                    there are no offers from other users yet. be the first to create one!
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="offers-grid">
                {offers.map((offer) => (
                    <OfferCard
                        key={offer.publicKey}
                        offer={offer}
                        isOwner={false}
                        onTake={handleTakeOffer}
                    />
                ))}
            </div>

            {selectedOffer && (
                <TakeOfferModal
                    offer={selectedOffer}
                    onClose={() => setSelectedOffer(null)}
                    onConfirm={confirmTakeOffer}
                    loading={loading}
                />
            )}
        </>
    );
};
