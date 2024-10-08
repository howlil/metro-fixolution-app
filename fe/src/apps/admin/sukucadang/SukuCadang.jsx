import Button from "../../../components/ui/Button";
import Layout from "../../../components/admin/layout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ModalDelete from "../../../components/admin/modals/modalDelete";
import Tables from "../../../components/ui/Table";
import Loading from "../../../components/ui/Loading";
import { showToast } from "../../../components/ui/Toaster";
import { Toaster } from "react-hot-toast";
import api from "../../../utils/axios";
import { Plus } from "lucide-react";
import { useIsMobile } from "../../../utils/utils";

export default function SukuCadang() {
  const navigate = useNavigate();
  const [sukuCadang, setSukuCadang] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching data
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for deleting data
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const isMobile = useIsMobile();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const itemsPerPage = 10; // Items per page

  const columns = [
    { header: "Nama Suku Cadang", accessor: "nama" },
    { header: "Harga", accessor: "harga" },
    { header: "Stok", accessor: "stok" },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: data } = await api.get("/getAllSukuCadang");
      setSukuCadang(data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    navigate(`/manajemenSukuCadang/editSukuCadang/${row.id}`);
  };

  const handleView = (row) => {
    navigate(`/manajemenSukuCadang/${row.id}/transaksiSukuCadang`);
  };

  const handleDelete = async () => {
    setIsDeleting(true); // Start loading during deletion
    try {
      await api.delete(`/admin/deleteSukuCadang/${deleteId}`);
      fetchData();
      setShowDeleteModal(false);
      showToast("Suku Cadang berhasil dihapus", "success");
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false); // Stop loading after deletion
    }
  };

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sukuCadang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sukuCadang.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <Toaster />
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-xl md:text-3xl">Suku Cadang</h1>
        <Button
          onClick={() => navigate("/manajemenSukuCadang/addSukuCadang")}
          variant="primary"
          custom="md:px-8 p-2 rounded-md md:py-1.5"
        >
          {isMobile ? <Plus size={24} /> : "Tambah Data"}
        </Button>
      </div>
      <section className="mt-8 relative">
        {sukuCadang.length > 0 ? (
          <>
            <div className="overflow-x-scroll">
              <Tables
                columns={columns}
                data={currentItems}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={(row) => {
                  setDeleteId(row.id);
                  setShowDeleteModal(true);
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-12">
              <button
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "bg-base text-white"
                }`}
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "bg-base text-white"
                }`}
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-lg">Data suku cadang kosong</p>
        )}
      </section>
      {showDeleteModal && (
        <ModalDelete
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          isLoading={isDeleting} // Pass loading state to modal
        />
      )}
    </Layout>
  );
}
