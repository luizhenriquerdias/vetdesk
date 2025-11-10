export type Specialty = {
  id: string;
  name: string;
  appointmentFee: number;
};

export type CreateSpecialtyDto = {
  name: string;
  appointmentFee: number;
};

export type UpdateSpecialtyDto = {
  appointmentFee?: number;
};

export type SpecialtyResponse = Specialty;

