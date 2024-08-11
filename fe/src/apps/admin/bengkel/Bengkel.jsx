import Button from "../../../components/ui/Button";
import Layout from "../../../components/admin/layout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Tables from "../../../components/ui/Table";
import ModalDelete from "../../../components/admin/modals/modalDelete";
import getAllBengkel from "../../../apis/bengkel/getAllBengkel";
import deleteBengkel from "../../../apis/bengkel/deleteBengkel";
import Loading from "../../../components/ui/Loading";

export default function ManajemenBengkel() {
  const navigate = useNavigate();
  const [bengkel, setBengkel] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const columns = [
    { header: "Nama Bengkel", accessor: "namaBengkel" },
    { header: "No HP", accessor: "noHp" },
    { header: "Alamat", accessor: "alamat" },
  ];

  const fetchData = async () => {
    setIsLoading(true); // Start loading
    try {
      const data = await getAllBengkel();
      setBengkel(data.data);
    } catch (error) {
      console.error("Failed to fetch bengkel data:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    navigate(`/manajemenBengkel/editBengkel/${row.id}`);
  };

  const handleView = (row) => {
    navigate(`/manajemenBengkel/${row.id}/layananBengkel`);
  };

  const handleDelete = async () => {
    try {
      const id = deleteId;
      await deleteBengkel(id);
      setBengkel(bengkel.filter((item) => item.id !== deleteId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-3xl">Manajemen Bengkel</h1>
        <Button 
          variant="primary"   
          onClick={() => navigate("/manajemenBengkel/AddBengkel")}
          custom="px-8 py-1.5">
          Tambah Bengkel
        </Button>
      </div>
      <section className="mt-8">
        {isLoading ? (
          <div className="fixed inset-0  bg-opacity-50 bg-gray-800 flex justify-center items-center z-50">
            <Loading type="spin" color="#ffffff" />
          </div>
        ) : (
          <Tables
            columns={columns}
            data={bengkel}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(row) => {
              setDeleteId(row.id);
              setShowDeleteModal(true);
            }}        
          />
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
