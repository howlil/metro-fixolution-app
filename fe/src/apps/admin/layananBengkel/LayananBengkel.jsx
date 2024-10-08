import Layout from "../../../components/admin/layout";
import Button from "../../../components/ui/Button";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tables from "../../../components/ui/TableNoView";
import ModalDelete from "../../../components/admin/modals/modalDelete";
import api from "../../../utils/axios";
import Loading from "../../../components/ui/Loading";
import { showToast } from "../../../components/ui/Toaster";
import { Toaster } from "react-hot-toast";
import { Plus } from "lucide-react";
import { useIsMobile } from "../../../utils/utils";

export default function LayananBengkel() {
  const [bengkel, setBengkel] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [nama_bengkel, setNamaBengkel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [errorMessage, setErrorMessage] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(bengkel.length / itemsPerPage);

  // Get data for the current page
  const currentData = bengkel.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: response } = await api.get(`${id}/getAllLayananBengkel`);

      const updatedData = response.data.map((item) => ({
        ...item,
        jamOperational: `${item.jam_buka} - ${item.jam_tutup}`,
      }));

      setBengkel(updatedData);
      setNamaBengkel(updatedData[0]?.bengkel?.nama_bengkel || "");
    } catch (error) {
      setErrorMessage(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row) => {
    navigate(
      `/manajemenBengkel/${id}/layananBengkel/editLayananBengkel/${row.id}`
    );
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { data: data } = await api.delete(
        `${id}/deleteLayananBengkel/${deleteId}`
      );
      setShowDeleteModal(false);
      showToast(data.message, "success");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response.data.message);
      showToast(error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { header: "Nama Layanan", accessor: "nama_layanan" },
    { header: "Kisaran Harga", accessor: "harga" },
    { header: "Jam Operational", accessor: "jamOperational" },
  ];

  const navigateToAddLayananBengkel = () => {
    const newPath = `/manajemenBengkel/${id}/layananBengkel/addLayananBengkel`;
    navigate(newPath);
  };

  // Pagination handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <Toaster />
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-xl md:text-3xl">{`Layanan ${nama_bengkel}`}</h1>
        <Button
          variant="primary"
          onClick={navigateToAddLayananBengkel}
          custom="md:px-8  p-2 rounded-md md:py-1.5"
        >
          {isMobile ? <Plus size={24} /> : "Tambah Layanan"}
        </Button>
      </div>
      <section className="mt-8">
        {bengkel.length > 0 ? (
          <>
            <div className="overflow-x-scroll">
              <Tables
                columns={columns}
                data={currentData} // Display paginated data here
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
          <p className="text-center">{errorMessage || "Tidak ada data"}</p>
        )}
      </section>
      {showDeleteModal && (
        <ModalDelete
          onDelete={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </Layout>
  );
}
