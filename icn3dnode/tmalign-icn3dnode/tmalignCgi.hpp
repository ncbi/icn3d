/* ===========================================================================
 *
 *                            PUBLIC DOMAIN NOTICE
 *               National Center for Biotechnology Information
 *
 *  This software/database is a "United States Government Work" under the
 *  terms of the United States Copyright Act.  It was written as part of
 *  the author's official duties as a United States Government employee and
 *  thus cannot be copyrighted.  This software/database is freely available
 *  to the public for use. The National Library of Medicine and the U.S.
 *  Government have not placed any restriction on its use or reproduction.
 *
 *  Although all reasonable efforts have been taken to ensure the accuracy
 *  and reliability of the software and data, the NLM and the U.S.
 *  Government do not and cannot warrant the performance or results that
 *  may be obtained by using this software or data. The NLM and the U.S.
 *  Government disclaim all warranties, express or implied, including
 *  warranties of performance, merchantability or fitness for any particular
 *  purpose.
 *
 *  Please cite the author in any work or product based on this material.
 *
 * ===========================================================================
 *
 * File Name:
 *
 * Author:  Jiyao Wang
 *
 * File Description:
 *
 */

#ifndef CTMALIGN_CGI
#define CTMALIGN_CGI

/*
#include "PubStructApi.hpp"

#include <misc/jsonwrapp/jsonwrapp.hpp>

#include <cgi/cgiapp.hpp>
*/

#include <iostream>
#include <fstream>
#include <sstream>

#include <vector>
#include <set>
#include <map>

using namespace std;
//USING_NCBI_SCOPE;

/////////////////////////////////////////////////////////////////////////////
//  CTmalignCgi::

class CTmalignCgi
{
public:
	CTmalignCgi();
	~CTmalignCgi();

	void print_version();
	void print_extra_help();
	void print_help(bool h_opt=false);
	void PrintErrorAndQuit(const string sErrorString);
	template <typename T> inline T getmin(const T &a, const T &b);
	template <class A> void NewArray(A *** array, int Narray1, int Narray2);
	template <class A> void DeleteArray(A *** array, int Narray);
	string AAmap(char A);
	char AAmap(const string &AA);
	void split(const string &line, vector<string> &line_vec, const char delimiter=' ');
	string Trim(const string &inputString);
	void split_white(const string &line, vector<string> &line_vec, vector<string>&white_vec, const char delimiter=' ');
	size_t get_PDB_lines(const string filename, vector<vector<string> >&PDB_lines, vector<string> &chainID_list, vector<int> &mol_vec, const int ter_opt, const int infmt_opt, const string atom_opt, const int split_opt, const int het_opt);
	size_t get_FASTA_lines(const string filename, vector<vector<string> >&FASTA_lines, vector<string> &chainID_list, vector<int> &mol_vec, const int ter_opt=3, const int split_opt=0);
	int extract_aln_from_resi(vector<string> &sequence, char *seqx, char *seqy, const vector<string> resi_vec1, const vector<string> resi_vec2, const int byresi_opt);
	int read_PDB(const vector<string> &PDB_lines, double **a, char *seq, vector<string> &resi_vec, const int byresi_opt);
	double dist(double x[3], double y[3]);
	double dot(double *a, double *b);
	void transform(double t[3], double u[3][3], double *x, double *x1);
	void do_rotation(double **x, double **x1, int len, double t[3], double u[3][3]);
	void read_user_alignment(vector<string>&sequence, const string &fname_lign, const int i_opt);
	void file2chainlist(vector<string>&chain_list, const string &name, const string &dir_opt, const string &suffix_opt);
	bool Kabsch(double **x, double **y, int n, int mode, double *rms, double t[3], double u[3][3]);
	void NWDP_TM(double **score, bool **path, double **val, int len1, int len2, double gap_open, int j2i[]);
	void NWDP_TM(bool **path, double **val, double **x, double **y, int len1, int len2, double t[3], double u[3][3], double d02, double gap_open, int j2i[]);
	void NWDP_SE(bool **path, double **val, double **x, double **y, int len1, int len2, double d02, double gap_open, int j2i[]);
	void NWDP_TM(bool **path, double **val, const char *secx, const char *secy, const int len1, const int len2, const double gap_open, int j2i[]);
	void parameter_set4search(const int xlen, const int ylen, double &D0_MIN, double &Lnorm, double &score_d8, double &d0, double &d0_search, double &dcu0);
	void parameter_set4final_C3prime(const double len, double &D0_MIN, double &Lnorm, double &d0, double &d0_search);
	void parameter_set4final(const double len, double &D0_MIN, double &Lnorm, double &d0, double &d0_search, const int mol_type);
	void parameter_set4scale(const int len, const double d_s, double &Lnorm, double &d0, double &d0_search);
	int score_fun8( double **xa, double **ya, int n_ali, double d, int i_ali[], double *score1, int score_sum_method, const double Lnorm, const double score_d8, const double d0);
	int score_fun8_standard(double **xa, double **ya, int n_ali, double d, int i_ali[], double *score1, int score_sum_method, double score_d8, double d0);
	double TMscore8_search(double **r1, double **r2, double **xtm, double **ytm, double **xt, int Lali, double t0[3], double u0[3][3], int simplify_step, int score_sum_method, double *Rcomm, double local_d0_search, double Lnorm, double score_d8, double d0);
	double TMscore8_search_standard( double **r1, double **r2, double **xtm, double **ytm, double **xt, int Lali, double t0[3], double u0[3][3], int simplify_step, int score_sum_method, double *Rcomm, double local_d0_search, double score_d8, double d0);
	double detailed_search(double **r1, double **r2, double **xtm, double **ytm, double **xt, double **x, double **y, int xlen, int ylen, int invmap0[], double t[3], double u[3][3], int simplify_step, int score_sum_method, double local_d0_search, double Lnorm, double score_d8, double d0);
	double detailed_search_standard( double **r1, double **r2, double **xtm, double **ytm, double **xt, double **x, double **y, int xlen, int ylen, int invmap0[], double t[3], double u[3][3], int simplify_step, int score_sum_method, double local_d0_search, const bool& bNormalize, double Lnorm, double score_d8, double d0);
	double get_score_fast( double **r1, double **r2, double **xtm, double **ytm, double **x, double **y, int xlen, int ylen, int invmap[], double d0, double d0_search, double t[3], double u[3][3]);
	double get_initial(double **r1, double **r2, double **xtm, double **ytm, double **x, double **y, int xlen, int ylen, int *y2x, double d0, double d0_search, const bool fast_opt, double t[3], double u[3][3]);
	void smooth(int *sec, int len);
	char sec_str(double dis13, double dis14, double dis15, double dis24, double dis25, double dis35);
	void make_sec(double **x, int len, char *sec);
	void get_initial_ss(bool **path, double **val, const char *secx, const char *secy, int xlen, int ylen, int *y2x);
	bool get_initial5( double **r1, double **r2, double **xtm, double **ytm, bool **path, double **val, double **x, double **y, int xlen, int ylen, int *y2x, double d0, double d0_search, const bool fast_opt, const double D0_MIN);
	void score_matrix_rmsd_sec( double **r1, double **r2, double **score, const char *secx, const char *secy, double **x, double **y, int xlen, int ylen, int *y2x, const double D0_MIN, double d0);
	void get_initial_ssplus(double **r1, double **r2, double **score, bool **path, double **val, const char *secx, const char *secy, double **x, double **y, int xlen, int ylen, int *y2x0, int *y2x, const double D0_MIN, double d0);
	void find_max_frag(double **x, int len, int *start_max, int *end_max, double dcu0, const bool fast_opt);
	double get_initial_fgt(double **r1, double **r2, double **xtm, double **ytm, double **x, double **y, int xlen, int ylen, int *y2x, double d0, double d0_search, double dcu0, const bool fast_opt, double t[3], double u[3][3]);
	double DP_iter(double **r1, double **r2, double **xtm, double **ytm, double **xt, bool **path, double **val, double **x, double **y, int xlen, int ylen, double t[3], double u[3][3], int invmap0[], int g1, int g2, int iteration_max, double local_d0_search, double D0_MIN, double Lnorm, double d0, double score_d8);
	void output_superpose(const string xname, const string yname, const string fname_super, double t[3], double u[3][3], const int ter_opt, const int mirror_opt, const char *seqM, const char *seqxA, const char *seqyA, const vector<string>&resi_vec1, const vector<string>&resi_vec2, const char *chainID1, const char *chainID2, const int xlen, const int ylen, const double d0A, const int n_ali8, const double rmsd, const double TM1, const double Liden);
	void output_rotation_matrix(const char* fname_matrix, const double t[3], const double u[3][3]);
	void output_results(const string xname, const string yname, const char *chainID1, const char *chainID2, const int xlen, const int ylen, double t[3], double u[3][3], const double TM1, const double TM2, const double TM3, const double TM4, const double TM5, const double rmsd, const double d0_out, const char *seqM, const char *seqxA, const char *seqyA, const double Liden, const int n_ali8, const int L_ali, const double TM_ali, const double rmsd_ali, const double TM_0, const double d0_0, const double d0A, const double d0B, const double Lnorm_ass, const double d0_scale, const double d0a, const double d0u, const char* fname_matrix, const int outfmt_opt, const int ter_opt, const string fname_super, const int i_opt, const int a_opt, const bool u_opt, const bool d_opt, const int mirror_opt, const vector<string>&resi_vec1, const vector<string>&resi_vec2);
	double standard_TMscore(double **r1, double **r2, double **xtm, double **ytm, double **xt, double **x, double **y, int xlen, int ylen, int invmap[], int& L_ali, double& RMSD, double D0_MIN, double Lnorm, double d0, double d0_search, double score_d8, double t[3], double u[3][3], const int mol_type);
	void copy_t_u(double t[3], double u[3][3], double t0[3], double u0[3][3]);
	double approx_TM(const int xlen, const int ylen, const int a_opt, double **xa, double **ya, double t[3], double u[3][3], const int invmap0[], const int mol_type);
	void clean_up_after_approx_TM(int *invmap0, int *invmap, double **score, bool **path, double **val, double **xtm, double **ytm, double **xt, double **r1, double **r2, const int xlen, const int minlen);
	int TMalign_main(double **xa, double **ya, const char *seqx, const char *seqy, const char *secx, const char *secy, double t0[3], double u0[3][3], double &TM1, double &TM2, double &TM3, double &TM4, double &TM5, double &d0_0, double &TM_0, double &d0A, double &d0B, double &d0u, double &d0a, double &d0_out, string &seqM, string &seqxA, string &seqyA, double &rmsd0, int &L_ali, double &Liden, double &TM_ali, double &rmsd_ali, int &n_ali, int &n_ali8, const int xlen, const int ylen, const vector<string> sequence, const double Lnorm_ass, const double d0_scale, const int i_opt, const int a_opt, const bool u_opt, const bool d_opt, const bool fast_opt, const int mol_type, const double TMcut=-1);
	int CPalign_main(double **xa, double **ya, const char *seqx, const char *seqy, const char *secx, const char *secy, double t0[3], double u0[3][3], double &TM1, double &TM2, double &TM3, double &TM4, double &TM5, double &d0_0, double &TM_0, double &d0A, double &d0B, double &d0u, double &d0a, double &d0_out, string &seqM, string &seqxA, string &seqyA, double &rmsd0, int &L_ali, double &Liden, double &TM_ali, double &rmsd_ali, int &n_ali, int &n_ali8, const int xlen, const int ylen, const vector<string> sequence, const double Lnorm_ass, const double d0_scale, const int i_opt, const int a_opt, const bool u_opt, const bool d_opt, const bool fast_opt, const int mol_type, const double TMcut=-1);

	int main_func();

	void resi2igstrand();
	void igstrand2kabat();
	void igstrand2imgt();

	vector<string> string2lines(string str);
	string replaceString(string& str, const string& from, const string& to);

//private:
  //custom PDB1, PDB2
  string m_pdb_query, m_pdb_target, m_queryid;

  string m_output;

  map< string, map< string, string > > mmResi2Igstrand, mmIg2Kabat, mmIg2Imgt;
};

#endif
