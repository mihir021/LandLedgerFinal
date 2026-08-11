/**
 * India States, Districts, and Cities/Talukas Hierarchy Data
 * Primarily featuring full coverage for Gujarat, Maharashtra, Karnataka, etc.
 */
export const INDIA_LOCATION_DATA = {
  Gujarat: {
    Ahmedabad: ['Ahmedabad City', 'Sanand', 'Dholka', 'Bavla', 'Viramgam', 'Mandal', 'Detroj'],
    Rajkot: ['Rajkot City', 'Gondal', 'Jetpur', 'Dhoraji', 'Morbi', 'Jasdan', 'Paddhari', 'Kotda Sangani'],
    Surat: ['Surat City', 'Choryasi', 'Olpad', 'Kamrej', 'Bardoli', 'Mahuva', 'Mandvi', 'Palsana'],
    Vadodara: ['Vadodara City', 'Dabhoi', 'Karjan', 'Padra', 'Savli', 'Waghodia', 'Desar'],
    Bhavnagar: ['Bhavnagar City', 'Palitana', 'Mahuva', 'Gariadhar', 'Sihor', 'Talaja', 'Umrala', 'Vallabhipur'],
    Jamnagar: ['Jamnagar City', 'Jodiya', 'Dhrol', 'Kalavad', 'Lalpur', 'Jamjodhpur'],
    Junagadh: ['Junagadh City', 'Keshod', 'Mangrol', 'Manavadar', 'Visavadar', 'Bhanvad', 'Maliya'],
    Kutch: ['Bhuj', 'Anjar', 'Gandhidham', 'Mandvi', 'Mundra', 'Nakhatrana', 'Rapar', 'Bhachau'],
    Gandhinagar: ['Gandhinagar City', 'Kalol', 'Dehgam', 'Mansa'],
    Amreli: ['Amreli City', 'Babra', 'Dhari', 'Rajula', 'Savarkundla', 'Lathi', 'Khambha', 'Jafrabad'],
    Anand: ['Anand City', 'Borsad', 'Petlad', 'Khambhat', 'Umreth', 'Tarapur', 'Sojitra'],
    Bharuch: ['Bharuch City', 'Ankleshwar', 'Jambusar', 'Vagra', 'Hansot', 'Valia'],
    Mehsana: ['Mehsana City', 'Kadi', 'Visnagar', 'Unjha', 'Vadnagar', 'Vijapur', 'Satlasana'],
    Morbi: ['Morbi City', 'Wankaner', 'Halvad', 'Tankara', 'Maliya'],
    Patan: ['Patan City', 'Sidhpur', 'Chanasma', 'Harij', 'Radhanpur', 'Sami'],
  },
  Maharashtra: {
    Mumbai: ['Mumbai City', 'Andheri', 'Bandra', 'Borivali', 'Kurla', 'Ghatkopar'],
    Pune: ['Pune City', 'Haveli', 'Baramati', 'Shirur', 'Junner', 'Maval', 'Khed', 'Mulshi'],
    Nagpur: ['Nagpur City', 'Kamptee', 'Hingna', 'Katol', 'Savner', 'Ramtek'],
    Thane: ['Thane City', 'Kalyan', 'Bhiwandi', 'Ulhasnagar', 'Murbad', 'Shahapur'],
    Nashik: ['Nashik City', 'Malegaon', 'Sinnar', 'Igatpuri', 'Niphad', 'Yeola'],
    Aurangabad: ['Aurangabad City', 'Paithan', 'Sillod', 'Kannad', 'Gangapur', 'Vaijapur'],
  },
  Karnataka: {
    'Bengaluru Urban': ['Bengaluru North', 'Bengaluru South', 'Bengaluru East', 'Anekal', 'Yelahanka'],
    Mysuru: ['Mysuru City', 'Nanjangud', 'Hunsur', 'T.Narsipur', 'K.R.Nagar', 'Periyapatna'],
    Mangaluru: ['Mangaluru City', 'Bantwal', 'Puttur', 'Belthangady', 'Sullia'],
    Hubballi: ['Hubballi City', 'Dharwad', 'Kalghatgi', 'Navalgund', 'Kundgol'],
    Belagavi: ['Belagavi City', 'Gokak', 'Chikkodi', 'Khanapur', 'Bailhongal'],
  },
  'Uttar Pradesh': {
    Lucknow: ['Lucknow City', 'Bakshi Ka Talab', 'Malihabad', 'Mohanlalganj', 'Sarojini Nagar'],
    Kanpur: ['Kanpur City', 'Ghatampur', 'Bilhaur'],
    Varanasi: ['Varanasi City', 'Pindra', 'Phooalpur'],
    Noida: ['Gautam Buddha Nagar', 'Greater Noida', 'Dadri', 'Jewar'],
  },
  Delhi: {
    'New Delhi': ['Connaught Place', 'Chanakyapuri', 'Vasant Vihar'],
    'South Delhi': ['Saket', 'Hauz Khas', 'Mehrauli'],
    'North Delhi': ['Model Town', 'Civil Lines', 'Kotwali'],
  },
};

export const STATES_LIST = Object.keys(INDIA_LOCATION_DATA);
