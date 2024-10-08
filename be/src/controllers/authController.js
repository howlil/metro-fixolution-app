const { prisma } = require('../configs/prisma');
const bcrypt = require('bcrypt');
const yup = require('yup');
const {createToken} = require('../utils/token');

exports.registerSuperadmin = async (req, res) => {
  const superadminSchema = yup.object().shape({
      username: yup.string().min(3).max(30).required(),
      password: yup.string().min(3).max(30).required(),
  });

  try {
      await superadminSchema.validate(req.body);

      const { username, password } = req.body;

      const existingUser = await prisma.superadmin.findUnique({
          where: {
              username: username,
          },
      });

      if (existingUser) {
          return res.status(400).json({
            message: "Username sudah terdaftar",
            data: null,
              success: false,
          });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.superadmin.create({
          data: {
              username: username,
              password: hashedPassword,
          },
      });

      res.status(201).json({
          message: "Regis berhasil",
          data: user,
          success: true,
      });
  } catch (error) {
      console.error('Registration Error:', error);

      if (error instanceof yup.ValidationError) {
          res.status(400).json({
              message: error.errors[0],
              data: null,
              success: false,
          });
      } else {
          res.status(500).json({
              message: "Internal Server Error",
              data: null,
              success: false,
          });
      }
  }
};

exports.registerUser = async (req, res) => {
    const userSchema = yup.object().shape({
        username: yup.string().min(3).max(30).required(),
        password: yup.string().min(6).max(30).required(),
        no_hp : yup.string().min(10).max(13).required(),
        nama : yup.string().min(3).max(30).optional(),
    });
    try {
        const validData = await userSchema.validate(req.body);
        const existingUser = await prisma.user.findUnique({
          where: {
              username: validData.username,
          },
      });

      if (existingUser) {
          return res.status(400).json({
              message: "Username sudah terdaftar",
              data: null,
              success: false,
          });
      }

        const hashedPassword = await bcrypt.hash(validData.password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: validData.username,
                password: hashedPassword,
                no_hp: validData.no_hp,
                nama: validData.nama, 
            },
        });

        return res.status(201).json({
            message: "User berhasil didaftarkan",
            data: newUser,
            success: true,
        });
    } catch (err) {
        if (err instanceof yup.ValidationError) {
            return res.status(400).json({
                message: err.errors[0],
                data: null,
                success: false,
            });
        } else {
            console.error('Database error:', err);
            return res.status(500).json({
                message: "Database error",
                data: null,
                success: false,
            });
        }
    }
};

exports.login = async (req, res) => {
  const schema = yup.object().shape({
    username: yup.string().min(3).max(30).required(),
    password: yup.string().min(3).max(30).required(),
  });

  try {
    await schema.validate(req.body);

    const { username, password } = req.body;

    // Cek apakah user adalah superadmin, user, atau bengkel
    const superadmin = await prisma.superadmin.findUnique({ where: { username } });
    const user = await prisma.user.findUnique({ where: { username } });
    const bengkel = await prisma.bengkel.findUnique({ where: { username } });

    // Tentukan account dan userType berdasarkan siapa yang login
    let account = superadmin || user || bengkel;
    let userType = superadmin ? 'superadmin' : user ? 'user' : 'bengkel';

    if (!account) {
      return res.status(400).json({
        message: "Invalid username or password",
        data: null,
        success: false,
      });
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, account.password);

    if (!isValidPassword) {
      return res.status(400).json({
        message: "Invalid username or password",
        data: null,
        success: false,
      });
    }

    const dataToken ={
      user_id: user ? user.id : null,
      admin_id: superadmin ? superadmin.id : null,
      bengkel_id: bengkel ? bengkel.id : null,
      userType: userType,
    }

    // Buat token menggunakan informasi yang relevan
    const token = createToken(account, dataToken);

    // Simpan token hanya dengan field ID yang relevan
    await prisma.token.create({
      data: {
        token: token,
        user_id: user ? user.id : null,
        admin_id: superadmin ? superadmin.id : null,
        bengkel_id: bengkel ? bengkel.id : null,
      },
    });

    res.status(200).json({
      message: "Login successful",
      data: { token },
      success: true,
    });
  } catch (error) {
    console.error('Login Error:', error);

    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors[0],
        success: false,
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }
};
