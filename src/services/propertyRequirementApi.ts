import {apiRequest} from '@/api';
export type RequirementStatus='DRAFT'|'PUBLISHED'|'PAUSED'|'CLOSED'; export type PaymentPreference='SELF_FUNDED'|'HOME_LOAN'|'PART_LOAN'|'NOT_DECIDED';
export interface PropertyRequirement {id:string;status:RequirementStatus;propertyType?:{id:number;name:string;slug?:string|null}|null;state?:{id:number;name:string}|null;city?:{id:number;name:string}|null;localities:{id:number;name:string}[];nearbyLocalityAllowed:boolean;budgetMin?:string|null;budgetMax?:string|null;areaMin?:string|null;areaMax?:string|null;areaUnit?:string|null;purchaseTimeline?:string|null;targetPurchaseDate?:string|null;paymentPreference?:PaymentPreference|null;occupation?:string|null;loanRequirement?:string|null;loanStatus?:string|null;preferences?:Record<string,unknown>|null;additionalRequirement?:string|null;consentAccepted:boolean}
export type RequirementInput=Record<string,unknown>;
export const createPropertyRequirement=(body:RequirementInput)=>apiRequest<PropertyRequirement,RequirementInput>({endpoint:'/property-requirements',method:'POST',body});
export const myPropertyRequirements=()=>apiRequest<PropertyRequirement[]>({endpoint:'/property-requirements/me'});
export const getPropertyRequirement=(id:string)=>apiRequest<PropertyRequirement>({endpoint:`/property-requirements/${id}`});
export const updatePropertyRequirement=(id:string,body:RequirementInput)=>apiRequest<PropertyRequirement,RequirementInput>({endpoint:`/property-requirements/${id}`,method:'PATCH',body});
export const transitionPropertyRequirement=(id:string,action:'publish'|'pause'|'resume'|'close',body:RequirementInput={})=>apiRequest<PropertyRequirement,RequirementInput>({endpoint:`/property-requirements/${id}/${action}`,method:'POST',body});
