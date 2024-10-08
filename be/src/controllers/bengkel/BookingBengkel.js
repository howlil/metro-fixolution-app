const { prisma } = require("../../configs/prisma");
const yup = require("yup");

// Schema validasi untuk booking layanan
const bookingSchema = yup.object().shape({
  bengkel_id: yup.string().required("Bengkel harus dipilih"),
  layanan_id: yup.string().required("Layanan harus dipilih"),
  tanggal: yup.string().required("Tanggal harus diisi "),
  jam_mulai: yup.string().required("Jam mulai harus diisi "),
});

exports.bookLayanan = async (req, res) => {
  try {
    // Validasi input dari user
    const validData = await bookingSchema.validate(req.body);

    // Cek apakah bengkel ada
    const bengkel = await prisma.bengkel.findUnique({
      where: { id: validData.bengkel_id },
    });

    if (!bengkel) {
      return res.status(404).json({
        message: "Bengkel tidak ditemukan",
        success: false,
      });
    }

    // Cek apakah layanan ada di bengkel tersebut
    const layanan = await prisma.layanan.findUnique({
      where: { id: validData.layanan_id },
      include: { bengkel: true }, // Relasi dengan bengkel
    });

    if (!layanan || layanan.bengkel_id !== validData.bengkel_id) {
      return res.status(404).json({
        message:
          "Layanan tidak valid atau tidak tersedia di bengkel yang dipilih",
        success: false,
      });
    }

    // Use only the date part for `tanggal` and keep `jam_mulai` as time
    const dateOnly = new Date(validData.tanggal);
    if (isNaN(dateOnly.getTime())) {
      return res.status(400).json({
        message: "Format tanggal tidak valid",
        success: false,
      });
    }

    // Create a full Date object by combining the date and time
    const [hours, minutes] = validData.jam_mulai.split(':');
    const combinedDateTime = new Date(dateOnly);
    combinedDateTime.setHours(hours, minutes, 0); // Set the time

    const unixTime = Math.floor(combinedDateTime.getTime() / 1000); // Convert to Unix timestamp

    if (isNaN(unixTime)) {
      return res.status(400).json({
        message: "Format tanggal atau jam_mulai tidak valid",
        success: false,
      });
    }

    // Buat booking baru dengan status PENDING
    const booking = await prisma.booking_layanan.create({
      data: {
        user_id: req.userId, // ID user yang login
        bengkel_id: validData.bengkel_id,
        layanan_id: validData.layanan_id,
        tanggal: Math.floor(dateOnly.getTime() / 1000), // Store Unix time for the date
        jam_mulai: unixTime, // Store Unix time for the specific time of day
        status: "PENDING",
        pesan_bengkel: "", // Admin bisa menambahkan pesan setelah menolak/menyetujui
      },
    });

    res.status(201).json({
      message: "Booking berhasil dibuat",
      data: booking,
      success: true,
    });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return res.status(400).json({
        message: err.errors[0],
        success: false,
      });
    } else {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Database error",
        success: false,
      });
    }
  }
};



exports.respondToBooking = async (req, res) => {
  const { booking_id } = req.params;
  const { status, pesan_bengkel } = req.body;

  try {
    const booking = await prisma.booking_layanan.findUnique({
      where: { id: booking_id },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
        success: false,
      });
    }

    const updatedBooking = await prisma.booking_layanan.update({
      where: { id: booking_id },
      data: {
        status: status.toUpperCase(),
        pesan_bengkel: pesan_bengkel,
      },
    });

    return res.status(200).json({
      message: `Booking berhasil ${
        status === "APPROVED" ? "disetujui" : "ditolak"
      }`,
      data: updatedBooking,
      success: true,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({
      message: "Database error",
      success: false,
    });
  }
};

exports.getBookingsByBengkel = async (req, res) => {
  try {
    const bengkel = await prisma.bengkel.findFirst({
      where: { id: req.userId }, // Cek apakah user adalah pemilik bengkel
    });

    if (!bengkel) {
      return res.status(403).json({
        message: "Anda tidak memiliki hak akses ke bengkel ini",
        success: false,
      });
    }

    const bookings = await prisma.booking_layanan.findMany({
      where: { bengkel_id: req.userId },
      include: {
        user: true, // Include detail user
        bengkel: {
          include: { foto: true },
        },
        layanan: true, 
      },
    });

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Tidak ada booking yang ditemukan untuk bengkel ini",
        success: false,
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil semua booking untuk bengkel",
      data: bookings,
      success: true,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({
      message: "Database error",
      success: false,
    });
  }
};

// exports.getAllBookings = async (req, res) => {
//   try {
//     // Ambil semua booking layanan bengkel
//     const bookings = await prisma.booking_layanan.findMany({
//       include: {
//         user: true,  // Include detail user
//         bengkel: true,  // Include detail bengkel
//         layanan: true,  // Include detail layanan
//       },
//     });

//     if (bookings.length === 0) {
//       return res.status(404).json({
//         message: "Tidak ada booking yang ditemukan",
//         success: false,
//       });
//     }

//     res.status(200).json({
//       message: "Berhasil mengambil semua booking",
//       data: bookings,
//       success: true,
//     });
//   } catch (err) {
//     console.error("Database error:", err);
//     return res.status(500).json({
//       message: "Database error",
//       success: false,
//     });
//   }
// };

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking_layanan.findMany({
      where: { user_id: req.userId },
      include: {
        user: true,
        bengkel: {
          include: { foto: true },
        },
        layanan: true,
      },
    });

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "Tidak ada booking yang ditemukan",
        success: false,
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil semua booking",
      data: bookings,
      type: "Booking",
      success: true,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({
      message: "Database error",
      success: false,
    });
  }
};
