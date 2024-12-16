import { L } from "@src/lib/abpUtility";
import AppConsts from "@src/lib/appconst";

const rules = {
   no_kytudacbiet: {
      pattern: /^(?![!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$)/,
      message: L("Không được chứa ký tự đặc biệt"),
   },
   MACAdress: {
      pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      message: L("Địa chỉ MAC không hợp lệ"),
    },    
   noAllSpaces: {
      validator: (_: any, value: any) => {
         return new Promise<void>((resolve, reject) => {
            if (value && value.trim() === "") {
               reject(L("Không được để khoảng trắng"));
            } else {
               resolve();
            }
         });
      },
   },
   required: { required: true, message: L("Trường này là bắt buộc") },
   requiredImage: { required: true, message: L("Ảnh là bắt buộc") },
   messageForNumber: { required: true, message: L("Không để trống và chỉ nhập số nguyên dương") },
   noSpaces: {
      pattern: /^\S*$/,
      message: L("Không được chứa khoảng trắng"),
   },
   maxName: {
      max: AppConsts.maxLength.name,
      message: L("Nhập quá số lượng ký tự"),
   },
   maxCodeBank: {
      max: AppConsts.maxLength.code,
      message: L("Nhập quá số lượng ký tự"),
   },
   mediaName: {
      max: AppConsts.maxLength.mediaName,
      message: L("Nhập quá số lượng ký tự"),
   },
   maxPrice: {
      max: AppConsts.maxLength.price,
      message: L("Nhập quá số tiền quy định"),
   },
   emailAddress: {
      max: AppConsts.maxLength.email,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g,
      message: L("Email không đúng"),
   },

   cccd: {
      pattern: /^[0-9]{12}$/,
      message: L("Số căn cước công dân không hợp lệ"),
   },
   rfMoney: {
      pattern: /^([1-9]\d{0,6}|0)$/,
      message: L("Số tiền vượt ngưỡng cho phép"),
   },
   address: {
      pattern: /^[a-zA-Z0-9\s]{4,}$/,
      message: L("Ít nhất 5 ký tự"),
   },
   phone: {
      max: AppConsts.maxLength.phone,
      pattern: /^[\+]?[(]?[0-9]{1,3}[)]?[\ ]?[-\s\.]?[0-9]{9}$/,
      message: L("Số điện thoại không hợp lệ"),
   },
   password: {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,32}$/,
      min: AppConsts.maxLength.password,
      message: L(
         L("Mật khẩu phải chứa ít nhất 8 ký tự và chứa chữ hoa, chữ thường")
      ),
   },
   description: {
      max: AppConsts.maxLength.description,
      message: L("Nhập quá số lượng ký tự"),
   },
   codeSoft: {
      max: AppConsts.maxLength.codeSoft,
      message: L("Nhập quá số lượng ký tự"),
   },
   userName: (value: any) => {
      if (!value) {
         return Promise.reject('Vui lòng nhập tên người liên hệ.');
      }
      if (!/^[\p{L}]/u.test(value)) {
         return Promise.reject('Ký tự đầu tiên phải là chữ.');
      }
      return Promise.resolve();
   },

   chucai_so_kytudacbiet: {
      // pattern: /^[a-zA-Z][a-zA-Z0-9!@#$%^&*()+]*$/,
      pattern: /^[a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ!@#$%^&*()+_ ]*$/,
      message: L("Không hợp lệ"),
   },
   chucai_so: {
      // pattern: /^[a-zA-Z][a-zA-Z0-9!@#$%^&*()+]*$/,
      pattern: /^[a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ_ ]*$/,
      message: L("Không hợp lệ"),
   },
   so_kytudacbiet: {
      pattern: /^[0-9!@#$%^&*()+_ ]*$/,
      message: L("Không hợp lệ"),
   },
   onlyLetter: {
      pattern: /^[a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ_ ]*$/,
      message: L("Không hợp lệ"),
   },
   numberOnly: {
      pattern: /^[0-9]\d*$/,
      message: L("Chỉ nhập ký tự số"),
   },
   website: {
      pattern: /^[a-zA-Z0-9!@#$%^&*()+_./]*$/,
      message: L("Không hợp lệ"),
   },
   no_number: {
      pattern: /^(?=.*[^\d])[\s\S]*$/,
      message: L("Không hợp lệ"),
   },
   gioi_han_ten: {
      max: AppConsts.maxLength.ten,
      message: L("Nhập quá số lượng ký tự"),
   },
   maxNameBank: {
      max: AppConsts.maxLength.address,
      message: L("Nhập quá số lượng ký tự"),
   },
   layout: {
      pattern: /^(\d+)(\|\d+)*$/,
      message: L("Kiểu bố cục không hợp lệ!"),
   },
   maxLengthLayout: {
      max: AppConsts.maxLength.layout,
      message: 'Nhập quá số lượng ký tự',
   },
};

export default rules;
