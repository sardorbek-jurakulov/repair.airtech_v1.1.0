const router = require('express').Router();

// FOR CONNECT WITH PostgreSQL database
const pool = require('../config/db');

// FOR JWT TOKEN AND COOKIE
const jwtDecode = require('../public/scripts/jwt-decode');
const jwt = require('jsonwebtoken');

// FOR HASH PASSWORD
const bcrypt = require('bcrypt');

// FOR WORK WITH .env CONFIG FILE
require("dotenv").config();

// FOR UPLOAD(FROM SERVER TO CLIENT) .xlsx file
const ExcelJS = require('exceljs');

// FOR DOWNLOAD(FROM CLIENT TO SERVER) .xlsx file
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

const userTexts = require('../userTexts.js');

let selectedLanguage = 'en';

/********************************** LOGIN FORM *********************************/
router.get('/login', async (req, res) => {
  res.render('login', {
      error_message: '',
      login: '',
      password: '',
      table_number: '',
      userTexts,
      selectedLanguage
    });
});
// TO DO change endpoint from login to signin.
// TO DO render qilinadigan fayl nomini signin ga o'zgartirishimiz kk.


/********************************** LOGIN *********************************/
router.post('/login', async (req, res) => {
  const { login, password, table_number } = req.body;
  console.log("login: ", login, "/npassword: ", password, "tabel_number: ", table_number);
  try {
    const user = (await pool.query(`
      SELECT * FROM users
      WHERE user_login = $1 AND user_table_number = $2;`,
      [
        login,
        Number(table_number)
      ]
    )).rows[0];
    console.log(user);
    if (!user) {
      return res.render('login', {
        error_message: userTexts.loginOrTableNumberEnteredIncorrectly[selectedLanguage],
        username,
        password,
        table_number,
        userTexts,
        selectedLanguage
      });
    }
    if (!(await bcrypt.compare(password, user.user.password))) {
      return res.render('login', {
        error_message: userTexts.loginOrTableNumberEnteredIncorrectly[selectedLanguage],
        username,
        password,
        table_number,
        userTexts,
        selectedLanguage
      });
    }
    const accessToken = jwt.sign({userRole: user.user_role_type_name, userFullName: user.user_full_name, userLogin: user.user_login}, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });
    res.cookie("accessToken", accessToken, { maxAge: 1440 * 24 * 60 * 60, httpOnly: true });
    res.redirect('/');
  } catch (err) {
    return res.render('login', {
      error_message: `Log in failed. Reason is ${err.message}`,
      login,
      password,
      table_number,
      userTexts,
      selectedLanguage
    });
  }
});
// TO DO change endpoint from login to signin


/***************************** MODERATOR REJECT ACTION ****************************/
async function authCheck (req, res, next) {
  if (!req.cookies.accessToken) {
    return res.redirect('/login');
  }
  const jwtDecoded = jwtDecode(req.cookies.accessToken);
  req.userRole = jwtDecoded.userRole;
  req.userFullName = jwtDecoded.userFullName;
  req.userLogin = jwtDecoded.userLogin;
  next();
}
// TO DO redirect bo'ladigan endpoint qiymatini sign in ga almashtirish kk.


/***************************** CHANGE LANGUAGE ****************************/
router.post('/changeLanguage/:changedLanguage', authCheck, (req, res) => {
  const { changedLanguage } = req.params;
  selectedLanguage = changedLanguage;
  return res.redirect('/');
});

router.get('/', authCheck, (req, res) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  res.render('index', {
    selectedSection: 'withoutSection',
    pageType: 'home',
    currentUser,
    userTexts,
    selectedLanguage
  });
});


/************************** GET ALL AIRPLANES *************************/
router.get('/airplanes/:airplaneServiceStatus', authCheck, async (req, res, next) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (!(isNaN(req.params.airplaneServiceStatus))) {
    next();
    return;
  }
  const airplaneServiceStatus = req.params.airplaneServiceStatus;
  let selectedSection = '';
  let airplanes = [];

  try {
    if (airplaneServiceStatus.length > 10) {
      // Front-end tomondan route'ni o'zgartirib sql so'rov yozilish holatini oldini olish uchun yozilgan kod.
      throw new Error();
    }

    if (airplaneServiceStatus === 'continuing') {
      selectedSection = 'repairingAirplanes';
    } else if (airplaneServiceStatus === 'completed') {
      selectedSection = 'repairedAirplanes';
    }

    airplanes = (await pool.query(`
      SELECT * FROM airplanes
      WHERE service_status = $1 ORDER BY info_created_date DESC;`,
      [airplaneServiceStatus]
    )).rows;
    res.render('index', {
      selectedSection,
      pageType: 'airplanes',
      airplanes,
      airplaneServiceStatus,
      currentUser,
      userTexts,
      selectedLanguage
    });
  } catch (err) {
    res.render('index', {
      selectedSection,
      pageType: 'airplanes',
      airplanes,
      currentUser,
      userTexts,
      selectedLanguage
    });
  }
});

/************************** GET ONE AIRPLANE *************************/
async function getOneAirplane(req, res, next, actionStatus = '', actionMessage = '' ) {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (isNaN(req.params.id)) {
    next();
    return;
  }
  const id = req.params.id;
  let selectedSection = '';
  let airplane = {};
  let spares = [];
  let actionResult = {
    status: '',
    message: ''
  };
  // action result status: success / error

  if (actionStatus !== '' && actionMessage !== '') {
    actionResult.status = actionStatus;
    actionResult.message = actionMessage;
  }
  try {
    airplane = (await pool.query(`SELECT * FROM airplanes WHERE id = $1;`, [id])).rows[0];
    if (!airplane) {
      throw new Error(userTexts.nonExistedAirplaneSelected[selectedLanguage]);
    }
    spares = (await pool.query(`
      SELECT * FROM spares
      WHERE airplane_id = $1 AND spare_usage_status = $2
      ORDER BY info_created_date DESC;`,
      [
        id,
        'installed to airplane'
      ])).rows;
    airplane.spares = spares;

    if (airplane.service_status === 'continuing') {
      selectedSection = 'repairingAirplanes';
    } else if (airplane.service_status === 'completed') {
      selectedSection = 'repairedAirplanes';
    }
  } catch (err) {
    actionResult.message = err.message;
    airplane = {};
    airplane.spares = spares;
  }
  res.render('index', {
    selectedSection,
    pageType: 'oneAirplane',
    airplane,
    actionResult,
    currentUser,
    userTexts,
    selectedLanguage
  });
}
router.get('/airplanes/:id', authCheck, getOneAirplane);


/************************** UPLOAD(FROM SERVER TO CLIENT) ONE AIRPLANE DATA AS .xlsx FILE *************************/
router.get('/oneAirplane/dataExport/:id', authCheck, async (req, res, next) => {
  const { id } = req.params;
  let airplane = {};
  let spares = [];

  try {
    airplane = (await pool.query(`SELECT * FROM airplanes WHERE id = $1;`, [id])).rows[0];
    // TODO airplane undefined bo'lib qolish holatini tekshirib catchga otvorishim kerak.
    spares = (await pool.query(`
      SELECT * FROM spares
      WHERE airplane_id = $1 AND spare_usage_status = $2
      ORDER BY info_created_date DESC;`,
      [
        id,
        'installed to airplane'
      ])).rows;
    // TODO spare undefined bo'lib qolish holatini tekshirib catchga otvorishim kerak.
    airplane.spares = spares;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${airplane.serial_number}`);

    let serviceStartedCompletedDate = ' ( ' + new Date(airplane.service_started_date).toLocaleDateString("ru-RU", {timeZone: "Asia/Tashkent"}) + ' - ';
    serviceStartedCompletedDate = serviceStartedCompletedDate + ((airplane.service_completed_date) ? new Date(airplane.service_completed_date).toLocaleDateString("ru-RU", {timeZone: "Asia/Tashkent"}) : '') + ' )';

    // EXCELL FILE TITLE
    const fileTitleCell = worksheet.getCell('B2');

    fileTitleCell.value = userTexts.oneAirplaneTableTitle['ru'] + serviceStartedCompletedDate + '\n' + userTexts.oneAirplaneTableTitle['en'] + serviceStartedCompletedDate;

    fileTitleCell.font = {
      name: 'Times New Roman',
      family: 4,
      size: 14,
      color: { argb: 'FF222222' },
    };

    fileTitleCell.alignment = {
      wrapText: true,
      horizontal: 'center', // or 'left', 'right'
      vertical: 'middle',   // or 'top', 'bottom
      bold: true,
    };

    fileTitleCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    fileTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC5D9F1' },
    };

    worksheet.getRow(2).height = 40;

    const sparePartCriteria = [
      '№',
      userTexts.demandNumber['ru'] + '\n' + userTexts.demandNumber['en'],
      userTexts.dateDD['ru'] + '\n' + userTexts.dateDD['en'],
      userTexts.description['ru'] + '\n' + userTexts.description['en'],
      userTexts.partNumber['ru'] + '\n' + userTexts.partNumber['en'],
      userTexts.materialType['ru'] + '\n' + userTexts.materialType['en'],
      userTexts.orderedQTY['ru'] + '\n' + userTexts.orderedQTY['en'],
      userTexts.unit['ru'] + '\n' + userTexts.unit['en'],
      userTexts.referenceTo['ru'] + '\n' + userTexts.referenceTo['en'],
      userTexts.requestedBy['ru'] + '\n' + userTexts.requestedBy['en'],
      userTexts.engineerPassed['ru'] + '\n' + userTexts.engineerPassed['en'],
      userTexts.acceptedByStoreKeeper['ru'] + '\n' + userTexts.acceptedByStoreKeeper['en'],
      userTexts.dateOfReceipt['ru'] + '\n' + userTexts.dateOfReceipt['en'],
      userTexts.quantityOfGoodsAndMaterialsReceipt['ru'] + '\n' + userTexts.quantityOfGoodsAndMaterialsReceipt['en'],
      userTexts.expirationDate['ru'] + '\n' + userTexts.expirationDate['en'],
      userTexts.pickedUpBy['ru'] + '\n' + userTexts.pickedUpBy['en'],
      userTexts.issuedOnBoardNumber['ru'] + '\n' + userTexts.issuedOnBoardNumber['en'],
      userTexts.passed['ru'] + '\n' + userTexts.passed['en'],
      userTexts.quantityOfBalance['ru'] + '\n' + userTexts.quantityOfBalance['en'],
      userTexts.rackNumber['ru'] + '\n' + userTexts.rackNumber['en'],
    ];
    const startRow = 3;
    const startCol = 2;
    const row = worksheet.getRow(startRow);
    row.height = 65;

    sparePartCriteria.forEach((value, colIndex) => {
      const cell = row.getCell(startCol + colIndex);
      cell.value = value;
        cell.font = {
          name: 'Times New Roman',
          family: 4,
          size: 12,
          color: { argb: 'FF222222' },
        };
        cell.alignment = {
          wrapText: true,
          horizontal: 'center', // or 'left', 'right'
          vertical: 'middle',   // or 'top', 'bottom
          bold: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC5D9F1' },
        };
    });

    worksheet.columns.forEach((column, index) => {
      if (index === 1) {
        column.width = 5;
        column.key = 'sequence_number';
      }
      if (index === 2) {
        column.width = 20;
        column.key = 'demand_number';
      }
      if (index === 3) {
        column.width = 15;
        column.key = 'date_dd';
      }
      if (index === 4) {
        column.width = 35;
        column.key = 'description';
      }
      if (index === 5) {
        column.width = 25;
        column.key = 'part_number';
      }
      if (index === 6) {
        column.width = 25;
        column.key = 'material_type';
      }
      if (index === 7) {
        column.width = 15;
        column.key = 'ordered_qty';
      }
      if (index === 8) {
        column.width = 10;
        column.key = 'unit';
      }
      if (index === 9) {
        column.width = 30;
        column.key = 'reference_to';
      }
      if (index === 10) {
        column.width = 30;
        column.key = 'requested_by';
      }
      if (index === 11) {
        column.width = 30;
        column.key = 'engineer_passed';
      }
      if (index === 12) {
        column.width = 30;
        column.key = 'accepted_by_store_keeper';
      }
      if (index === 13) {
        column.width = 20;
        column.key = 'date_of_receipt';
      }
      if (index === 14) {
        column.width = 20;
        column.key = 'quantity_of_goods_and_materials_receipt';
      }
      if (index === 15) {
        column.width = 20;
        column.key = 'expiration_date';
      }
      if (index === 16) {
        column.width = 30;
        column.key = 'picked_up_by';
      }
      if (index === 17) {
        column.width = 30;
        column.key = 'issued_on_board_number';
      }
      if (index === 18) {
        column.width = 15;
        column.key = 'passed';
      }
      if (index === 19) {
        column.width = 15;
        column.key = 'quantity_of_balance';
      }
      if (index === 20) {
        column.width = 15;
        column.key = 'rack_number';
      }
    });

    // Add rows
    airplane.spares.forEach((spare, spareIndex) => {
      spare.sequence_number = spareIndex + 1;
      // const worksheetRow = worksheet.addRow(spare);
      const worksheetRow = worksheet.addRow({
        sequence_number: spare.sequence_number,
        demand_number: spare.demand_number,
        date_dd: spare.date_dd.toLocaleDateString("ru-RU", {timeZone: "Asia/Tashkent"}),
        description: spare.description,
        part_number: spare.part_number,
        material_type: spare.material_type,
        ordered_qty: spare.ordered_qty,
        unit: spare.unit,
        reference_to: spare.reference_to,
        requested_by: spare.requested_by,
        engineer_passed: spare.engineer_passed,
        accepted_by_store_keeper: spare.accepted_by_store_keeper,
        date_of_receipt: spare.date_of_receipt.toLocaleDateString("ru-RU", {timeZone: "Asia/Tashkent"}),
        quantity_of_goods_and_materials_receipt: spare.quantity_of_goods_and_materials_receipt,
        expiration_date: spare.expiration_date,
        picked_up_by: spare.picked_up_by,
        issued_on_board_number: spare.issued_on_board_number,
        passed: spare.passed,
        quantity_of_balance: spare.quantity_of_balance,
        rack_number: spare.rack_number,
      });

      worksheetRow.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          family: 4,
          size: 12,
          color: { argb: 'FF222222' },
        };
        cell.alignment = { wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.getCell('sequence_number').alignment = {
        wrapText: true,
        horizontal: 'center',
        vertical: 'middle',
        bold: true,
      };
    });

    // Merge cells for rowspan effect
    worksheet.mergeCells('B2:U2');

    // Set the headers and filename for the response
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${airplane.serial_number + serviceStartedCompletedDate}.xlsx`
    );

    // Write the Excel file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    // TODO shu joyda dastur to'xtab qolmasligi uchun kod yozishim kerak.
    console.error('Error exporting data:', err);
    res.status(500).send('Internal Server Error');
  }
});


/************************** AIRPLANE FORM (ADD, EDIT OR DELETE AIRPALNES) *************************/
router.get('/airplaneForm/:formFor/:airplaneId', authCheck, async (req, res) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
    return res.redirect('/');
  }
  const { formFor, airplaneId } = req.params;

  if (formFor === 'addAirplane') {
    res.render('index', {
      selectedSection: 'addAirplaneForRepair',
      pageType: 'airplaneForm',
      formFor,
      currentUser,
      userTexts,
      selectedLanguage
    });
  } else if (formFor === 'editAirplane' || formFor === 'deleteAirplane') {
    try {
      const airplane = (await pool.query(`SELECT * FROM airplanes WHERE id = $1`, [airplaneId])).rows[0];
      res.render('index', {
        selectedSection: 'repairingAirplanes',
        pageType: 'airplaneForm',
        formFor,
        airplane,
        currentUser,
        userTexts,
        selectedLanguage
      });
    } catch (err) {
      let actionResult = {
        status: 'error',
        message: `The connection to the database is not available, please try again later. ${err.message}`
      };
      res.render('index', {
        selectedSection: 'repairingAirplanes',
        pageType: 'airplaneForm',
        formFor,
        actionResult,
        currentUser,
        userTexts,
        selectedLanguage
      });
    }
  }
});


/******************************* AIRPLANE ACTIONS ******************************/
router.post('/repairingAirplanes', authCheck, async (req, res) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
    return res.redirect('/');
  }
  let { _method, ...airplane } = req.body;
  let actionResult = {
    status: '',
    message: ''
  };

  /************************** POST REPAIRING AIRPLANE *************************/
  if (_method === 'POST') {
    try {
      airplane = (await pool.query(`
        INSERT INTO airplanes (
          serial_number,
          service_started_date,
          info_created_username,
          info_updated_username
        ) VALUES ($1, $2, $3, $4) RETURNING *;`,
        [
          airplane.serial_number,
          airplane.service_started_date,
          currentUser.username,
          currentUser.username
        ])).rows[0];
      actionResult.status = 'success';
      actionResult.message = `${airplane.serial_number} ${userTexts.airplaneSuccessfullyAdded[selectedLanguage]}`;
    } catch(err) {
      actionResult.status = 'error';
      actionResult.message = `${airplane.serial_number} ${userTexts.airplaneNotAdded[selectedLanguage]} ${err.message}`;
    }
    res.render('index', {
      selectedSection: 'addAirplaneForRepair',
      pageType: 'airplaneForm',
      formFor: 'addAirplane',
      airplane,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });

  } else if (_method === 'PUT') {

    /************************** PUT REPAIRING AIRPLANE *************************/
    try {
      // const currentDateTime = new Date().toLocaleString("ru-RU", {timeZone: "Asia/Tashkent"});
      const currentDateTime = new Date().toLocaleString();
      airplane = (await pool.query(`
        UPDATE airplanes
        SET serial_number = $1,
            service_started_date = $2,
            info_updated_date = $3,
            info_updated_username = $4
        WHERE id = $5 RETURNING *;`,
        [
          airplane.serial_number,
          airplane.service_started_date,
          currentDateTime,
          currentUser.username,
          airplane.id
        ])).rows[0];
      actionResult.status = 'success';
      actionResult.message = `${airplane.serial_number} ${userTexts.airplaneSuccessfullyEdited[selectedLanguage]}`;
    } catch(err) {
      actionResult.status = 'error';
      actionResult.message = `${airplane.serial_number} ${userTexts.airplaneNotEdited[selectedLanguage]} ${err.message}`;
    }
    res.render('index', {
      selectedSection: 'repairingAirplanes',
      pageType: 'airplaneForm',
      formFor: 'editAirplane',
      airplane,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });

  } else if (_method === 'DELETE') {

    /*********************** DELETE(COMPLETE) REPAIRING AIRPLANE **********************/
    try {
      // const currentDateTime = new Date().toLocaleString("ru-RU", {timeZone: "Asia/Tashkent"});
      const currentDateTime = new Date().toLocaleString();
      airplane = (await pool.query(`
        UPDATE airplanes
        SET service_completed_date = $1,
            service_status = $2,
            info_updated_date = $3,
            info_updated_username = $4
        WHERE id = $5 RETURNING *;`,
        [
          airplane.service_completed_date,
          'completed',
          currentDateTime,
          currentUser.username,
          airplane.id
        ])).rows[0];
      actionResult.status = 'success';
      actionResult.message = `${userTexts.airplaneSuccessfullyCompleted[selectedLanguage]}`;
    } catch(err) {
      actionResult.status = 'error';
      actionResult.message = `${userTexts.airplaneNotCompleted[selectedLanguage]} ${err.message}`;
    }
    res.render('index', {
      selectedSection: 'repairingAirplanes',
      pageType: 'airplaneForm',
      formFor: 'deleteAirplane',
      airplane,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });
  }
});

/************************** SPARE FORM (ADD, EDIT, DELETE SPARE) *************************/
router.get('/spareForm/:formFor/:airplaneId/:airplaneSerialNumber/:spareId', authCheck, async (req, res, next) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
    return res.redirect('/');
  }
  const formFor = req.params.formFor;
  const airplane = {
    id: req.params.airplaneId,
    serialNumber: req.params.airplaneSerialNumber
  };
  const spareId = req.params.spareId;

  if (formFor === 'addSpare') {
    res.render('index', {
      selectedSection: 'repairingAirplanes',
      pageType: 'spareForm',
      formFor,
      airplane,
      currentUser,
      userTexts,
      selectedLanguage
    });
  } else if (formFor === 'editSpare') {
    try {
      const spare = (await pool.query(`
        SELECT * FROM spares WHERE id = $1;`,
        [spareId]
      )).rows[0];
      res.render('index', {
        selectedSection: 'repairingAirplanes',
        pageType: 'spareForm',
        formFor,
        airplane,
        spare,
        currentUser,
        userTexts,
        selectedLanguage
      });
    } catch (err) {
      const actionResult = {
        status: 'error',
        message: `Could not retrieve the spare belonging to the ${airplane.serialNumber} from the database ❌. Reasone is: ${err.message}. Please try again later! `
      };

      res.render('index', {
        selectedSection: 'repairingAirplanes',
        pageType: 'spareForm',
        formFor,
        airplane,
        actionResult,
        currentUser,
        userTexts,
        selectedLanguage
      });
    }
  } else if (formFor === 'deleteSpare') {
    // const currentDateTime = new Date().toLocaleString("ru-RU", {timeZone: "Asia/Tashkent"});
    const currentDateTime = new Date().toLocaleString();
    try {
      const spare = (await pool.query(`
      UPDATE spares
      SET info_updated_date = $1,
          info_updated_username = $2,
          spare_usage_status = $3
      WHERE id = $4 RETURNING *;`,
      [
        currentDateTime,
        currentUser.username,
        'taken back from airplane',
        spareId
      ])).rows[0];
      req.params.id = airplane.id;
      getOneAirplane(req, res, next, 'success', `${userTexts.spareSuccessfullyDeleted[selectedLanguage]} ${airplane.serialNumber} ✅`);
    } catch (err) {
      req.params.id = airplane.id;
      getOneAirplane(req, res, next, 'error', `${userTexts.spareNotDeleted[selectedLanguage]} ${airplane.serialNumber} ❌. ${userTexts.reasonIs[selectedLanguage]} ${err.message}`);
    }
  }
});


/************************** DOWNLOAD(FROM CLIENT TO SERVER) ONE AIRPLANE DATA AS .xlsx FILE *************************/
// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, '../public/uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Append the original file extension
//   },
// });

// const upload = multer({ storage: storage });

// // Create uploads directory if it doesn't exist
// const fs = require('fs');
// const uploadDir = '../public/uploads';
// if (!fs.existsSync(uploadDir)){
//     fs.mkdirSync(uploadDir);
// }

// Route to upload .xlsx file
// router.post('/oneAirplane/dataImport/:id', upload.single('file'), async (req, res) => {
//   try {
//     // Read the uploaded file
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(worksheet);
//     console.log(data);

//     // Iterate over the data and insert into PostgreSQL
//     // for (const row of data) {
//     //   const { column1, column2, column3 } = row; // Adjust column names as per your .xlsx file
//     //   spare = (await pool.query(`
//     //   INSERT INTO spares (
//     //     airplane_id,
//     //     demand_number,
//     //     date_dd,
//     //     description,
//     //     part_number,
//     //     material_type,
//     //     ordered_qty,
//     //     unit,
//     //     reference_to,
//     //     requested_by,
//     //     engineer_passed,
//     //     accepted_by_store_keeper,
//     //     date_of_receipt,
//     //     quantity_of_goods_and_materials_receipt,
//     //     expiration_date,
//     //     picked_up_by,
//     //     issued_on_board_number,
//     //     passed,
//     //     quantity_of_balance,
//     //     rack_number,
//     //     info_created_date,
//     //     info_created_username,
//     //     info_updated_date,
//     //     info_updated_username
//     //   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING *;
//     //   `, [
//     //     airplane.id,
//     //     spare.demand_number,
//     //     spare.date_dd,
//     //     spare.description,
//     //     spare.part_number,
//     //     spare.material_type,
//     //     spare.ordered_qty,
//     //     spare.unit,
//     //     spare.reference_to,
//     //     spare.requested_by,
//     //     spare.engineer_passed,
//     //     spare.accepted_by_store_keeper,
//     //     spare.date_of_receipt,
//     //     spare.quantity_of_goods_and_materials_receipt,
//     //     spare.expiration_date,
//     //     spare.picked_up_by,
//     //     spare.issued_on_board_number,
//     //     spare.passed,
//     //     spare.quantity_of_balance,
//     //     spare.rack_number,
//     //     currentDateTime,
//     //     currentUser.username,
//     //     currentDateTime,
//     //     currentUser.username
//     //   ])).rows[0];
//     // }

//     res.send('File uploaded and data inserted successfully!');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('An error occurred');
//   }
// });


/************************** SPARE ACTIONS *************************/
router.post('/spare', authCheck, async (req, res) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
    return res.redirect('/');
  }
  const actionResult = {
    status: '',
    message: ''
  }
  // action result status: success / error

  let {
      _method,
      _airplane_id,
      _airplane_serial_number,
      ...spare
    } = req.body;

  const airplane = {
    id: _airplane_id,
    serialNumber: _airplane_serial_number
  };
  // const currentDateTime = new Date().toLocaleString("ru-RU", {timeZone: "Asia/Tashkent"});
  const currentDateTime = new Date().toLocaleString();

  /************************** POST SPARE *************************/
  if (_method === 'POST') {
    try {
      spare = (await pool.query(`
      INSERT INTO spares (
        airplane_id,
        demand_number,
        date_dd,
        description,
        part_number,
        material_type,
        ordered_qty,
        unit,
        reference_to,
        requested_by,
        engineer_passed,
        accepted_by_store_keeper,
        date_of_receipt,
        quantity_of_goods_and_materials_receipt,
        expiration_date,
        picked_up_by,
        issued_on_board_number,
        passed,
        quantity_of_balance,
        rack_number,
        info_created_date,
        info_created_username,
        info_updated_date,
        info_updated_username
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING *;`,
      [
        airplane.id,
        spare.demand_number,
        spare.date_dd,
        spare.description,
        spare.part_number,
        spare.material_type,
        spare.ordered_qty,
        spare.unit,
        spare.reference_to,
        spare.requested_by,
        spare.engineer_passed,
        spare.accepted_by_store_keeper,
        spare.date_of_receipt,
        spare.quantity_of_goods_and_materials_receipt,
        spare.expiration_date,
        spare.picked_up_by,
        spare.issued_on_board_number,
        spare.passed,
        spare.quantity_of_balance,
        spare.rack_number,
        currentDateTime,
        currentUser.username,
        currentDateTime,
        currentUser.username
      ])).rows[0];
      actionResult.status = 'success';
      actionResult.message = `${userTexts.spareSuccessfullyAdded[selectedLanguage]} ${airplane.serialNumber} ✅`;
    } catch (err) {
      actionResult.status = 'error';
      actionResult.message = `${userTexts.spareNotAdded[selectedLanguage]} ${err}`;
    }
    res.render('index', {
      selectedSection: 'repairingAirplanes',
      pageType: 'spareForm',
      formFor: 'addSpare',
      airplane,
      spare,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });
  } else if (_method === 'PUT') {

    /************************** PUT SPARE *************************/
    try {
      spare = (await pool.query(`
      UPDATE spares
      SET airplane_id = $1,
          demand_number = $2,
          date_dd = $3,
          description = $4,
          part_number = $5,
          material_type = $6,
          ordered_qty = $7,
          unit = $8,
          reference_to = $9,
          requested_by = $10,
          engineer_passed = $11,
          accepted_by_store_keeper = $12,
          date_of_receipt = $13,
          quantity_of_goods_and_materials_receipt = $14,
          expiration_date = $15,
          picked_up_by = $16,
          issued_on_board_number = $17,
          passed = $18,
          quantity_of_balance = $19,
          rack_number = $20,
          info_updated_date = $21,
          info_updated_username = $22
      WHERE id = $23 RETURNING *;`,
      [
        airplane.id,
        spare.demand_number,
        spare.date_dd,
        spare.description,
        spare.part_number,
        spare.material_type,
        spare.ordered_qty,
        spare.unit,
        spare.reference_to,
        spare.requested_by,
        spare.engineer_passed,
        spare.accepted_by_store_keeper,
        spare.date_of_receipt,
        spare.quantity_of_goods_and_materials_receipt,
        spare.expiration_date,
        spare.picked_up_by,
        spare.issued_on_board_number,
        spare.passed,
        spare.quantity_of_balance,
        spare.rack_number,
        currentDateTime,
        currentUser.username,
        spare.id
      ])).rows[0];
      actionResult.status = 'success';
      actionResult.message = userTexts.spareSuccessfullyEdited[selectedLanguage];
    } catch (err) {
      actionResult.status = 'error';
      actionResult.message = `${userTexts.spareNotEdited[selectedLanguage]} ${err.message}`;
    }
    res.render('index', {
      selectedSection: 'repairingAirplanes',
      pageType: 'spareForm',
      formFor: 'editSpare',
      airplane,
      spare,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });
  }
});


/************************** GET ALL USERS *************************/
async function getAllUsers(req, res, next, actionStatus = '', actionMessage = '') {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (currentUser.role !== 'admin') {
    return res.redirect('/')
  }
  let actionResult = {
    status: '',
    message: ''
  };
  // action result status: success / error
  let users = [];
  if (actionStatus !== '' && actionMessage !== '') {
    actionResult.status = actionStatus;
    actionResult.message = actionMessage;
  }
  try {
    users = (await pool.query(`
      SELECT * FROM users
      WHERE login_status = 'allowed' ORDER BY full_name;`
    )).rows;
  } catch (err) {
    actionResult.message = err.message;
  }
  res.render('index', {
    selectedSection: 'users',
    pageType: 'users',
    users,
    actionResult,
    currentUser,
    userTexts,
    selectedLanguage
  });
}
router.get('/users', authCheck, getAllUsers);


/************************** USER FORM (ADD, EDIT OR DELETE) *************************/
router.get('/userForm/:formFor/:userId', authCheck, async (req, res, next) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (currentUser.role !== 'admin') {
    return res.redirect('/')
  }
  const { formFor, userId } = req.params;

  if (formFor === 'addUser') {
    res.render('index', {
      selectedSection: 'users',
      pageType: 'userForm',
      formFor,
      currentUser,
      userTexts,
      selectedLanguage
    });
  } else if (formFor === 'editUser') {
    try {
      const user = (await pool.query(`
        SELECT * FROM users WHERE id = $1`,
        [userId]
      )).rows[0];
      res.render('index', {
        selectedSection: 'users',
        pageType: 'userForm',
        formFor,
        user,
        currentUser,
        userTexts,
        selectedLanguage
      });
    } catch (err) {
      let actionResult = {
        status: 'error',
        message: `The connection to the database is not available, please try again later. Reason is: ${err.message}`
      };
      res.render('index', {
        selectedSection: 'users',
        pageType: 'userForm',
        formFor,
        actionResult,
        currentUser,
        userTexts,
        selectedLanguage
      });
    }
  } else if (formFor === 'deleteUser') {
    // const currentDateTime = new Date().toLocaleString("ru-RU", {timeZone: "Asia/Tashkent"});
    const currentDateTime = new Date().toLocaleString();
    try {
      const user = (await pool.query(`
      UPDATE users
      SET login_status = $1,
          info_updated_date = $2,
          info_updated_username = $3
      WHERE id = $4 RETURNING *;`,
      [
        'not allowed',
        currentDateTime,
        currentUser.username,
        userId
      ])).rows[0];
      getAllUsers(req, res, next, 'success', `${userTexts.userSuccessfullyDeleted[selectedLanguage]}`);
    } catch (err) {
      getAllUsers(req, res, next, 'error', `${userTexts.userNotDeleted[selectedLanguage]} ${err.message}`);
    }
  }
});

router.post('/users', authCheck, async (req, res) => {
  const currentUser = {
    role: req.userRole,
    full_name: req.userFullName,
    login: req.userLogin
  };
  if (currentUser.role !== 'admin') {
    return res.redirect('/');
  }
  let { _method, ...user } = req.body;
  let actionResult = {
    status: '',
    message: ''
  };
  const hashedPasswordCharactersCount  = 12;

  try {
    // Generate a Password hash
    const hashes = await bcrypt.genSalt(hashedPasswordCharactersCount);
    // Hash the password with the hashes
    user.password = await bcrypt.hash(user.password, hashes);
  } catch (error) {
    actionResult.status = 'error';
    actionResult.message = `The attempt failed ❌. Reason is: ${err.message}`;
    res.render('index', {
      selectedSection: 'users',
      pageType: 'userForm',
      formFor: 'editUser',
      user,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });
  }

  /************************** POST USER *************************/
  if (_method === 'POST') {
    try {
      user = (await pool.query(`
        INSERT INTO users (
          full_name,
          username,
          password,
          table_number,
          role,
          info_created_username,
          info_updated_username
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
        [
          user.full_name,
          user.username,
          user.password,
          Number(user.table_number),
          user.role,
          currentUser.username,
          currentUser.username
        ])).rows[0];
      actionResult.status = 'success';
      actionResult.message = `${user.full_name} ${userTexts.userSuccessfullyAdded[selectedLanguage]}`;
    } catch(err) {
      actionResult.status = 'error';
      actionResult.message = `${user.full_name} ${userTexts.userNotAdded[selectedLanguage]} ${err.message}`;
    }
    res.render('index', {
      selectedSection: 'users',
      pageType: 'userForm',
      formFor: 'addUser',
      user,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });

  } else if (_method === 'PUT') {

    /************************** PUT USER *************************/
    try {
      // const currentDateTime = new Date().toLocaleString("ru-RU", {timeZone: "Asia/Tashkent"});
      const currentDateTime = new Date().toLocaleString();
      user = (await pool.query(`
        UPDATE users
        SET full_name = $1,
            username = $2,
            password = $3,
            table_number = $4,
            role = $5,
            info_updated_date = $6,
            info_updated_username = $7
        WHERE id = $8 RETURNING *;`,
        [
          user.full_name,
          user.username,
          user.password,
          user.table_number,
          user.role,
          currentDateTime,
          currentUser.username,
          user.id
        ])).rows[0];
      actionResult.status = 'success';
      actionResult.message = `${user.full_name} ${userTexts.userSuccessfullyEdited[selectedLanguage]}`;
    } catch(err) {
      actionResult.status = 'error';
      actionResult.message = `${user.full_name} ${userTexts.userNotEdited[selectedLanguage]} ${err.message}`;
    }
    res.render('index', {
      selectedSection: 'users',
      pageType: 'userForm',
      formFor: 'editUser',
      user,
      actionResult,
      currentUser,
      userTexts,
      selectedLanguage
    });
  }
});


/********************************** LOGOUT *********************************/
router.get('/logout', authCheck, async (req, res) => {
  res.cookie('accessToken', '', { maxAge: 0, httpOnly: true });
  res.redirect('/login');
});


/********************************** FOR TEST *********************************/
// async function test () {
//   let airplane = {
//     id: 1,
//     serial_number: 'AD3431195'
//   }
//   try {
//     airplane = (await pool.query(`SELECT * FROM airplanes WHERE id = $1;`, [airplane.id])).rows[0];
//     console.log('try');
//   } catch(err) {
//     console.log('catch', err.message);
//   }
// }

// test();



module.exports = router;