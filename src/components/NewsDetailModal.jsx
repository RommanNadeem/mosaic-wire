import { Dialog, DialogContent } from "./ui/dialog";
import NewsCard from "./NewsCard";

function NewsDetailModal({ expandedNewsId, newsData, onClose }) {
  if (!expandedNewsId) return null;

  const expandedItem = newsData.find(
    (item) => String(item.id) === expandedNewsId
  );

  if (!expandedItem) return null;

  return (
    <Dialog
      open={!!expandedNewsId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-4xl w-full h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-[var(--bg-card)] border-[var(--border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">
          <NewsCard
            newsItem={expandedItem}
            isHighlighted={false}
            highlightedNewsId={null}
            isExpanded={true}
            onTitleClick={onClose}
            onClose={onClose}
            onShare={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewsDetailModal;
