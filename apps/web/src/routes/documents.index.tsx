import { DocumentList } from "../components/documents/DocumentList";

export function DocumentsIndexRoute() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Documents</h1>
      <DocumentList />
    </div>
  );
}
