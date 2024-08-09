/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
const MESSAGES = {
  HTML_CREATION_ERROR_FOR_PDF:'Something went wrong with HTML creation.',
  INVALID_TOKEN: 'Token Invalid!',
  DATA_FOUND: 'Data Found!',
  NO_DATA_FOUND: 'No Data Found!',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successful!',
  SET_PASS: 'Set your password first!',
  IN_ACTIVATE_STUDENT: 'Your account is inactive.',
  IN_ACTIVATE_STAFF: 'Your account is inactive.',
  ACTIVATED: 'Student activated successfully.',
  IN_ACTIVATED: 'Student inactivated successfully.',
  ACTIVATED_STAFF: 'Staff activated successfully.',
  IN_ACTIVATED_STAFF: 'Staff inactivated successfully.',
  LOGIN_FAILED: 'Login Failed!',
  ALREADY_EXISTS: 'Record already exists in our records.',
  TEMP_ALREADY_EXISTS: 'Template with same name already exists.',
  EMAIL_ALREADY_EXISTS:
    'This email id is already associated with another user.',
  STUDENT_EMAIL_ALREADY_EXISTS: 'Student email already exist in our records !',
  FATHER_EMAIL_ALREADY_EXISTS: 'Father email already exist in our records !',
  MOTHER_EMAIL_ALREADY_EXISTS: 'Mother email already exist in our records !',
  GUARDIAN_EMAIL_ALREADY_EXISTS:
    'Guardian email already exist in our records !',
  NOT_EXISTS: 'Account does not exist in our records !',
  SOMETHING_WRONG: 'Something went wrong!',
  INVALID_EMAIL: 'You have entered an email is not exist in our records.',
  INVALID_PASSWORD:
    'You have entered a password that does not match your email.',
  INVALID_CRED: 'You have entered an invalid email address or password!',
  INVALID_MAIL: 'You have entered an invalid email address!',
  OTP_SENT: 'OTP has been sent to your registered email!',
  OTP_NOT_SENT: 'OTP send failed!',
  INVALID_OTP: 'You have entered an invalid OTP!',
  OTP_VERIFY: 'OTP verified successfully!',
  PASSWORD_VERIFIED: 'Password updated successfully!',
  BAD_REQUEST: 'Invalid request!',
  VALID_USER: 'Valid User',
  USER_TYPE_NOT_ACTIVE: 'User type not active!',
  VALIDATION_ERROR: 'Validation error!',
  DATA_NOT_CREATED: 'Record has not been created!',
  DATA_NOT_UPDATED: 'Record has not been updated!',
  DATA_UPDATED: 'Record updated successfully!',
  DATA_DELETED: 'Record deleted successfully!',
  DATA_NOT_DELETED: 'Could not delete record!',
  UNIQUE_ID_ALREADY_EXISTS: 'Uniques id is already in exists in our records.',
  STUDENT_USER_TYPE_NOT_FOUND: 'Student user type has not been found.',
  PARENT_USER_TYPE_NOT_FOUND: 'Parent user type has not been found.',
  USER_TYPE_NOT_FOUND: 'User type has not been found.',
  STAFFS_NOT_FOUND: 'Staff details has not been found.',
  STAFFS_ADDED: 'Staff details has been saved successfully.',
  STUDENTS_NOT_FOUND: 'Students has not been found.',
  REPORTCARD_STUDENTS_NOT_FOUND: 'Students not found.',
  STUDENTS_ADDED: 'Students has been added successfully.',
  STUDENTS_INVITED: 'Students has been invited successfully.',
  STAFF_INVITED: 'Staff has been invited successfully.',
  RECOVERY_EMAIL_SENT: 'Recovery link has been sent to the registered Email Id',
  FILE_REQUIRED: 'Input file is required!',
  FILE_UPLOADED: 'File uploaded successfully!',
  FILE_NOT_UPLOADED: 'Error uploading file!',
  EXCEL_GENERATION_FAILED: 'Excel generation failed',
  EXCEL_UPLOAD_FAILED: 'Excel upload failed',
  DATA_EXISTS: 'Record already exists',
  PASSWORD_ALREADY_SET: 'Password already set for this account!',
  INSTITUTION_NOT_FOUND: 'Institution has not been found!',
  INSTITUTION_ALREADY_EXIST: 'Institution Name already exists!',
  NOT_UNIQUE: 'Already exists with same value!',
  ALREADY_SUBMITTED_RESPONSE: 'You have already submitted a feedback response.',
  INVALID_TOKEN: 'Token Invalid!',
  DATA_FOUND: 'Data Found!',
  NO_DATA_FOUND: 'No Data Found!',
  LOGIN_SUCCESS: 'Login successful!',
  SET_PASS_SUCCESS: 'Password set successfully!',
  LOGOUT_SUCCESS: 'Logged out successful!',
  SET_PASS: 'Set your password first!',
  LOGIN_FAILED: 'Login Failed!',
  ALREADY_EXISTS: 'Record already exists in our records.',
  EMAIL_ALREADY_EXISTS:
    'This email id is already associated with another user.',
  MOBILENO_ALREADY_EXISTS:
    'This mobileNo is already associated with another user',
  CLASSMANAGEMENT_ALREADY_EXISTS:
    'This staff is already associated with another class in class management',
  SOMETHING_WRONG: 'Something went wrong!',
  INVALID_PASSWORD:
    'You have entered a password that does not match your email.',
  INVALID_CRED: 'You have entered an invalid email address or password!',
  INVALID_MAIL: 'You have entered an invalid email address!',
  INVALID_MOBILE: 'You have entered an invalid mobile no!',
  OTP_SENT: 'OTP has been sent to your registered email!',
  OTP_SENT_MOBILE: 'OTP hase been sent to your registered mobile number!',
  OTP_NOT_SENT: 'OTP send failed!',
  INVALID_OTP: 'You have entered an invalid OTP!',
  OTP_VERIFY: 'OTP verified successfully!',
  PASSWORD_VERIFIED: 'Password updated successfully!',
  BAD_REQUEST: 'Invalid request!',
  VALID_USER: 'Valid User',
  USER_TYPE_NOT_ACTIVE: 'User type not active!',
  VALIDATION_ERROR: 'Validation error!',
  VALIDATION_SUCCESSFULL: 'Validation success!',
  DATA_CREATED: 'Record created successfully!',
  DATA_NOT_CREATED: 'Record has not been created!',
  DATA_NOT_CREATED: 'Record has not been created!',
  SOME_DATA_NOT_UPDATED: 'Some records has not been created!',
  DATA_UPDATED: 'Record updated successfully!',
  UNIQUE_ID_ALREADY_EXISTS: 'Same unique id exists in the batch already.',
  EXCEL_UPLOAD_FAILED: 'Excel upload failed',
  DATA_EXISTS: 'Record already exists',
  PASSWORD_ALREADY_SET: 'Password already set for this account!',
  INSTITUTION_NOT_FOUND: 'Institution has not been found!',
  NOT_UNIQUE: 'Already exists with same value!',
  ALREADY_SUBMITTED_RESPONSE: 'You have already submitted a feedback response.',
  FEEDBACK_FORM_NOT_FOUND: 'Feedback form is not exist in our records',
  LIKE_DOUBT: 'Doubt Liked',
  UNLIKE_DOUBT: 'Doubt Unliked',
  RESOLVE_DOUBT: 'Doubt resolved successfully',
  UNRESOLVE_DOUBT: 'Response unmark successfully',
  STAFF_UNIQUE_EMPLOYEE_CODE:
    'This employee code already belongs to another member.',
  PROFILE_PIC_DELETED: 'Profile picture has been deleted successfully.',
  VALID_EMPID: 'Valid employee code',
  TEMPLATE_NOT_FOUND: 'Template not found',
  CAPACITY: 'You already have greater capacity',
  PENDING_CAPACITY: 'You already have a pending request',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated',
  INSTITUTE_IS_NOT_ACTIVE:
    'Please contact your institution since this credential is inactive',
  DATA_VALIDATED: 'Data validated successfully.',
  TRANSACTION_SUCCESS: 'Payment Done Successfully!',
  DATA_NOT_VALIDATED: 'Data not validated successfully.',
  MAX_QUESTION_LIMIT_EXCEEDED: 'Maximum question limit exceeded',
  NO_OF_ROWS_NOT_MATCHING: 'The number of rows are not exact',
  INVALID_ZIP_FILE: 'Invalid zip file',
  FAQ_CATEGORY_NOT_FOUND: 'FAQ category deos not exists',
  CANNOT_COMIT: 'Cannot Commit, please migrate all Students',
  DUPLICATE_PHONE_NUMBER: 'Added Phone Number already exixts',
  DUPLICATE_EMAIL: 'Added Email address already exixts',
  DUPLICATE_WEBSITE: 'Added website already exixts',
  TIMEPERIOD_BYPASS: 'Timeperiod cannot be bypassed',
  OVERLAP_HOLIDAY: 'Day is already marked as holiday',
  ARCHIVE_ONGOING: 'Access Blocked as Archiving in Progress',
  TRANSACTION_FAILED: 'Transaction failed',
  TRANSACTION_TIMED_OUT: 'Transaction timed out, awaiting Confirmation.',
  NO_TRANSACTION_FOUND: 'No such Transaction found',
  INVALID_KEY: 'Please provide valid key',
  NO_DELETE_COMMITTED: 'Cannot delete committed schedule',
  NO_DELETE_PAYMENT_EXISTS: 'Cannot delete schedule, Payment already exists',
  TITLE_ALREADY_EXISTS: 'Title already exists',
  DESCRIPTION_ALREADY_EXISTS: 'Description already exists',
  STUDENT_ALREADY_ISSUED_BOOK: 'Book already issued to student',

  UNAUTHORISED: 'You do not have permission to perform this action!',
  GENERAL_ERROR: 'Some error has been occured !',
  VALIDATION: {
    OTP: 'Otp should be minimum 6 digit',
    PASSWORD: 'Password should be minimum 6 character',
    DESC: 'Description should be maximum 300 character',
    ANNOUNCEMENT_DESC: 'Description should be maximum 1500 character'
  },
  GROUP: {
    CREATED: 'Group has been created successfully',
    UPDATED: 'Group has been updated successfully'
  },
  TIMETABLE: {
    NO_CLASS_FOUND: 'No Classes Today'
  },
  Generalstatus: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  },
  INSTITUTION_CODE_EXIT:'Another institute is already using the code. Please enter a different code.',
  STATE_ID_VALIDATION_MSG:'Please pass the state id',
  SOME_DATA_MISSING:'Some data missing or wrong from payload',
  PAYMENT_PENDING:'Payment is pending for this given id.',
  ORDER_PICKUP_SUCCESS: 'Item Order(s) has been confirmed successfully.',
  ORDER_REJECTED: 'Item orders has been rejected.',
  IS_ASSIGN_POSSIBLE:'Please select some students or items to assign the student(s).',
  SELECT_PROPER_NO_OF_STUDENT:'Please select proper no of students or items to assign.',
  ITEM_ASSIGN_TO_STUDENT:'Item has/have been assign to student(s) successfully.',
  ITEM_ASSIGN_TO_STAFF:'Item has/have been assign to staff(s) successfully.',
  VALID_ITEM_ID:'Please pass a valid item id.',
  MARKED_AS_DAMAGE:'Item is already marked as damaga item.',
  ORDER:{
    CHECK_ITEM_EXIT:'Please provide items that you want to order.',
    VALID_ITEM_ID:'Please provide valid item id.',
    VALID_ITEM_KIT_ID:'Please provide valid item kit id.',
    ALL_ITEMS_VALID:'All date validated'
  },
  KIT:{
    SELECTED_QTY_EXCEED:'The selected qty from the item kit exceeds the avaliable qty of the particular item.',
    REORDER_POINT_EXCEED:'The reorder point cannot exceed the quantity of the item kit.',
    KIT_ADDED_SUCCESS:'Item kit has been added successfully',
    KIT_UPDATE_SUCCESS:'Item kit has been updated successfully',
    VALID_ITEM_KITID:'Please pass valid kit id',
    QUANTITY_VALIDATION:'Quantity to assign should be less than equal to the avaliable qty.'
  },
  INVENTORY: {
    CATEGORY_MASTER: {
      CATEGORY_ALREADY_EXIST: 'Category name already exists',
      CATEGORY_UPDATED_SUCCESS: 'Category updated sucessfully',
      CATEGORY_UPDATED_FAIL: 'Category updatation failed'
    },
    UNIT_MASTER: {
      UNIT_ALREADY_EXIST: 'Unit name  already exists',
      UNIT_UPDATED_SUCCESS: 'Unit updated sucessfully',
      UNIT_UPDATED_FAIL: 'Unit updatation failed'
    },
    VENDOR_MASTER: {
      VENDOR_NAME_ALREADY_EXITS: 'Vendor name  already exists',
      VENDOR_UPDATE_SUCCESS: 'Vendor has updates successfully',
      VENDOR_UPDATE_FAIL: 'vendor updation failed',
      VENDOR_NOT_FOUND: 'vendor data not founde'
    },
    ITEM_MASTER: {
      ITEM_MOVED_TO_DAMAGE_MASTER: 'Item has been moved to non-issued section of damaged item master successfully.',
      ITEM_ADDED_TO_ITEM_MASTER: 'Item(s) has been added to the inventory successfully.',
      ITEM_MOVED_TO_DAMAGED_MASTER: 'Item has been moved to non-issued section of damaged item master successfully.',
      ITEM_EDITED_SUCCESS: 'Item(s) has been edited successfully.',
      ITEM_DELETED: 'Item has been deleted from item master successfully.',
      GENERATE_EMPTY_SHEET: 'Empty sheet is generated successfully.',
      NO_TEMPLATE_FOUND: 'No template sheet is found with given id.',
      ROW_MISMATCH: 'The number of rows are not exact.',
      INVALID_FILE: 'Invalid file entered.'
    },
    ITEM_REQ:{
      ITEM_CANNOT_TRANSFER:'Item requirement cannot be transferred to item master.',
      ITEM_TRANSFER_SUCCESS:'Item requirement has been transferred to item master successfully.'
    },
    APP: {
      OUT_OF_STOCK: 'Item is out of stock.',
      MINIMIZE_ORDER_QUANTITY: 'Please minimize the order.',
      ORDER_SUCCESS: 'Order has been successful.',
      INVALID_ORDERID:'Please pass a valid orderId.',
      EXCHANGE_SUCCESS:'Exchange request has been completed.'
    },
    DAMAGED_MASTER:{
      DAMAGED_REQ_MOVED_TO_DAMAGE_MASTER:'Item request has been moved to damage master successfully.',
      DELETE_DAMAGE_ITEM:'Item has been deleted from damage master successfully.'
    },
    RECEIPT_SETTING:{
      RECEIPT_ADDED_SUCCESS:'Inventory receipt settings has been saved successfully',
      RECEIPT_UPDATE_SUCCESS:'Inventory receipt settings has been updated successfully',
      INSTITUTE_CODE_ALREADY_EXIT:'Another institute is already using the code.Please enter a different code',
      NO_RECEIPT_FOUND:'No receipt is found with the given receipt Id',
      RECEIPT_CAN_BE_ADDED:'No receipt found with the given InstitutionCode,You can move forward.'
    },
    EXCHANGE:{
      CONFIRM_EXCHANGE:'Item exchange request has been confirmed successfully.',
      REJECT_EXCHANGE:'Item exchange request has been rejected successfully.',
      ASSIGN_ITEM_EXCHANGE:'Item exchange has been assigned successfully.',
      EXCHANGE_FOR_REJECT_ORDER:'You can not exchange rejected or not confirmed order.'
    }
  },
  COMMUNITY:{
    CREATE:'Community has been created successfully.',
    ALREADY_EXISTS:'Community name  already exists.',
    COMMUNITY_EDITED:'Community has been edited successfully.',
    COMMUNITY_DELETE:'Community has been deleted successfully.',
    ITEM_ASSIGNED:'Item has been assigned to community.',
    EDIT_ASSIGN_ITEM:'Item has been edited sucessfully',
    INVALID_ASSIGNED_ID:'No assigned item found from gived id.',
    INVALID_ITEM_ID:'Please pass a valid item id',
    RELEASE_SUCCESS:'Item has been released successfully.',
    INVALID_COMMUNITY_ID:'Please pass a valid community id.'
  },
  LOCATION:{
    ALREADY_EXIST:'Location with the given name already exists.',
    CREATED:'Location master has been created successfully.',
    INVALID_LOCATION_ID:'Please pass a valid location id',
    EDITED:'Location master has been edited successfully.',
    DELETED_LOCATION:'Location master has been deleted successfully.',
    ITEM_ASSIGNED:'Item has been assigned to location successfully.',
    DELETE_ASSIGNED_LOC:'Assigned item to location has been deleted successfully.'
  },
  OLD_STOCK:{
    CREATE:'Item has been added to old stock master successfully.',
    INVALID_OLD_STACKID:'Please pass a valid old stock id!'
  },
  VENDOR_PURCHASE_REQ:{
    EDIT:'Purchase request has been edited successfully'
  }
};

export default MESSAGES;

